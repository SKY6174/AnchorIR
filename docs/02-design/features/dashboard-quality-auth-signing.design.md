# dashboard-quality-auth-signing - Design Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/dashboard-quality-auth-signing.plan.md`

---

## 1. Overview

### 1.1 Purpose

앵커사업 대시보드의 화면과 업무 동작을 보존하면서 TypeScript, lint, 접근성, 번들 성능을 순차적으로 정상화하고, 기존 Supabase Auth와 `rise_users` 승인 계약에 이메일·SMS OTP를 연결한다. 위원회 결과보고서에는 현재의 서버 HMAC 무결성 봉인을 유지하면서 별도의 PAdES 인증서 서명 경계를 추가한다.

### 1.2 Design Goals

- JSX 태그 순서, Tailwind/CSS class, inline style, 표시 문자열과 화면 치수를 변경하지 않는다.
- 각 품질 단계의 실제 기준선을 먼저 측정하고 오류 종류·파일군별 작은 변경으로 처리한다.
- 기존 비밀번호 로그인과 `rise_users.uuid = auth.uid()` 계약을 유지한다.
- OTP 값, service role key, SMS provider secret, 인증서 개인키를 브라우저와 업무 테이블에 저장하지 않는다.
- HMAC 무결성 확인과 인증서 기반 전자서명을 데이터·표시·검증 단계에서 구분한다.
- 기관 인증서와 서명 사업자가 확정되지 않은 상태를 “공인 서명 완료”로 표시하지 않는다.

### 1.3 UI Preservation Contract

다음 항목은 변경 금지 대상으로 회귀 검증한다.

- JSX element 종류, 중첩, 순서와 조건부 표시 구조
- `className`, inline `style`, CSS 파일의 시각 속성
- 아이콘 크기, 글자, 여백, 색상, 표·모달·PDF 배치
- 기존 로그인, 위원회 표결, 결과보고서 생성 흐름

허용되는 변경은 import 방식, 타입 선언, 내부 함수, 데이터 adapter, 기존 태그의 비시각적 접근성 attribute와 키보드 handler다. 접근성 수정이 시각 결과나 DOM 구조에 영향을 주면 적용하지 않고 별도 예외 목록에서 재검토한다.

## 2. Architecture

### 2.1 System Architecture

```text
React/Vite dashboard
  ├─ quality gates: TypeScript → oxlint/react → jsx-a11y → build
  ├─ lazy feature boundaries
  ├─ Supabase Auth adapter
  │    ├─ password
  │    ├─ email OTP
  │    └─ SMS OTP
  └─ committee report client
       ├─ immutable report snapshot + HMAC seal
       └─ authenticated signing request
            → Supabase Edge Function
            → HSM/KMS or signing provider
            → TSA + PAdES signed PDF
            → private Storage + audit row
```

### 2.2 Workstream A - TypeScript

#### Configuration

- TypeScript 7에서 제거된 `baseUrl`을 삭제한다.
- alias target을 `./src/*`로 명시해 non-relative path 오류를 제거한다.
- `strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch`를 완화하지 않는다.
- `skipLibCheck`는 기존 값을 유지하되 애플리케이션 오류를 숨기는 exclude는 추가하지 않는다.

#### Error Processing

1. 설정 차단 오류 제거 후 전체 `tsc --noEmit --pretty false` 출력을 기준선 파일로 집계한다.
2. 오류 코드, 파일, 시스템 경계 순으로 묶는다.
3. Supabase row/insert/update, component props, browser event, nullable state, library API 순으로 수정한다.
4. UI 파일은 타입 영역과 handler만 수정하고 JSX/class/style diff가 없는지 검사한다.
5. 모든 batch에서 `tsc`, production build, 위원회 단위시험을 실행한다.

`any`의 기계적 전역 치환은 하지 않는다. 외부 데이터는 `unknown`으로 받아 type guard 또는 명시적 mapper에서 좁힌다.

### 2.3 Workstream B - Lint and Accessibility

공식 검사 명령에 React와 JSX 접근성 플러그인을 포함한다. 처리 순서는 다음과 같다.

1. `no-dupe-keys`, constant expression, hook dependency처럼 동작 오류 가능성이 있는 경고
2. 사용하지 않는 import·변수와 불필요 escape
3. label/control 연결과 accessible name
4. 클릭 가능한 비상호작용 태그의 키보드 동작
5. mouse-only 동작의 focus 동등성

접근성 보강은 기존 태그에 `id`, `htmlFor`, `aria-*`, `role`, `tabIndex`, `onKeyDown`, `onFocus`, `onBlur`를 추가하는 방식으로 제한한다. 기존 element를 다른 element로 바꾸거나 wrapper를 추가하지 않는다. 동등한 키보드 동작을 정의할 수 없는 항목은 무의미한 handler로 경고만 억제하지 않고 예외 근거를 기록한다.

### 2.4 Workstream C - Bundle and Performance

- `App.tsx`의 대형 관리 컴포넌트를 feature 단위 `React.lazy` 경계로 전환한다.
- 초기 화면에 필요한 Sidebar, KPI, Auth는 eager import를 유지한다.
- PDF, XLSX, AI, chart 라이브러리는 실제 기능 handler에서 dynamic import한다.
- 공통 `Suspense` 경계는 기존 로딩 표시 또는 `null` fallback을 사용해 새 레이아웃을 만들지 않는다.
- Vite `manualChunks`는 vendor 이름이 아닌 안정적인 라이브러리군으로만 나눈다.
- lazy import 실패는 기존 전역 오류 처리 경계를 사용하고 기능 재시도 가능성을 보존한다.

성공 기준은 초기 entry gzip 감소, 500KB 경고 해소 또는 명시된 vendor 예외, 기존 탭 첫 진입 성공이다. 총 다운로드 크기만 옮기고 초기 로드가 개선되지 않는 분할은 채택하지 않는다.

### 2.5 Workstream D - Supabase OTP

#### Authentication Contract

OTP는 별도 사용자 체계를 만들지 않고 Supabase Auth의 동일 사용자 세션을 발급한다. 인증 성공 후 공통 `resolveApprovedRiseUser(authUser)`가 다음을 검사한다.

1. `rise_users.uuid = auth.users.id`
2. `rise_users.approved = true`
3. role key가 허용된 역할로 mapping 가능

실패 시 local session을 폐기하고 사용자 존재 여부를 노출하지 않는 일반화된 오류를 반환한다.

#### Email OTP

- `signInWithOtp({ email, options: { shouldCreateUser: false } })`
- 메일 템플릿은 magic link 대신 OTP token을 사용하도록 Supabase Dashboard에서 설정한다.
- `verifyOtp({ email, token, type: "email" })`
- custom SMTP가 준비되지 않은 운영 환경에서는 기능 flag를 활성화하지 않는다.

#### SMS OTP

- 전화번호는 E.164 형식으로 변환해 `signInWithOtp({ phone })`에 전달한다.
- `verifyOtp({ phone, token, type: "sms" })`
- `rise_users`에는 전화번호를 새로 복제하지 않는다. 기존 `auth.users.phone`을 정본으로 사용하고, 관리용 주소록의 `rise_members.phoneMobile`은 동기화 입력으로만 취급한다.
- SMS provider, 발신 설정, 국가 허용 목록, 비용 한도 확인 전에는 SMS feature flag를 끈다.

#### Abuse Controls

- 클라이언트 재전송 cooldown과 Supabase Auth rate limit을 함께 적용한다.
- 실패 횟수·대기 상태를 메모리 상태로만 유지하며 OTP 원문은 로그·DB·분석 이벤트에 기록하지 않는다.
- CAPTCHA/provider fraud protection은 운영 provider 확정 후 활성화한다.
- 실제 프로젝트 rate limit은 배포 전 Supabase Dashboard 설정값을 확인한다.

OTP UI는 기능 flag가 켜진 경우에만 기존 로그인 카드 내부에서 별도 구현 단계로 활성화한다. UI 완전 보존 검증 전에는 adapter와 공통 프로필 복원만 배포할 수 있다.

### 2.6 Workstream E - Certificate PDF Signature

#### Trust Boundary

PAdES 처리는 브라우저가 아닌 Supabase Edge Function과 외부 서명 경계에서 수행한다. 개인키는 export 불가능한 HSM/KMS 또는 검증된 서명 사업자에 두며 Edge Function에는 최소 권한의 key reference만 둔다.

#### Signing Flow

1. 위원회 결과를 `committee_report_snapshots`로 확정하고 HMAC을 검증한다.
2. 클라이언트가 최종 unsigned PDF를 private staging object로 업로드한다.
3. 인증된 관리자가 snapshot ID와 object path로 서명 요청을 생성한다.
4. Edge Function이 사용자 역할, snapshot 무효화 여부, PDF SHA-256을 검증한다.
5. 서명 adapter가 PAdES profile, 기관 인증서와 TSA를 사용해 PDF를 서명한다.
6. signed PDF를 immutable private object path에 저장한다.
7. 인증서·timestamp·검증 결과를 감사 테이블에 기록한다.
8. 권한이 있는 요청에만 짧은 유효기간 signed URL을 발급한다.

최소 목표는 신뢰 시각을 포함한 PAdES-B-T다. 장기 보존 정책이 확정되면 검증 자료를 포함하는 B-LT 또는 B-LTA를 선택한다. 인증서/사업자/TSA가 확정되지 않으면 요청은 `provider_not_configured`로 실패하고 HMAC PDF만 기존 방식으로 제공한다.

## 3. Data Model

### 3.1 Existing Entities

| Entity | Role |
|---|---|
| `auth.users` | email, phone, Supabase session identity |
| `rise_users` | 승인 여부와 업무 역할, `uuid`로 Auth 연결 |
| `rise_members` | 관리용 주소록과 휴대전화 동기화 입력 |
| `committee_report_snapshots` | 결과보고서의 immutable payload와 HMAC |

### 3.2 New `committee_report_signatures`

| Column | Type | Rule |
|---|---|---|
| `id` | uuid | primary key |
| `snapshot_id` | uuid | valid report snapshot FK |
| `requested_by` | uuid | `auth.users.id` |
| `status` | text | pending/signing/signed/failed/revoked |
| `provider` | text | configured server provider key |
| `pades_profile` | text | B-T/B-LT/B-LTA |
| `unsigned_object_path` | text | private staging object |
| `signed_object_path` | text nullable | immutable private object |
| `unsigned_sha256` | text | lowercase hex digest |
| `signed_sha256` | text nullable | lowercase hex digest |
| `certificate_subject` | text nullable | parsed certificate metadata |
| `certificate_issuer` | text nullable | parsed certificate metadata |
| `certificate_serial` | text nullable | serial |
| `certificate_fingerprint` | text nullable | SHA-256 fingerprint |
| `signature_algorithm` | text nullable | provider result |
| `signed_at` | timestamptz nullable | trusted result time |
| `tsa_subject` | text nullable | timestamp authority |
| `timestamp_at` | timestamptz nullable | trusted timestamp |
| `validation_result` | jsonb nullable | normalized validation result |
| `error_code` | text nullable | safe machine code, no secret |
| `created_at`/`updated_at` | timestamptz | audit timestamps |

한 snapshot에는 profile/provider별 활성 서명 한 건만 허용한다. signed row의 object path와 digest는 일반 클라이언트가 update할 수 없으며 Edge Function service role만 상태 전이를 수행한다.

### 3.3 Storage

- `committee-report-staging`: private, unsigned PDF, 짧은 보존 기간
- `committee-signed-reports`: private, signed PDF, immutable path
- path는 `meeting_id/snapshot_id/signature_id.pdf` 형식
- 다운로드는 RLS 검증 후 단기 signed URL만 사용

## 4. API Specification

### 4.1 Client Auth Adapter

```ts
type OtpChannel = "email" | "sms";

requestOtp(input: { channel: OtpChannel; destination: string }): Promise<void>
verifyOtp(input: {
  channel: OtpChannel;
  destination: string;
  token: string;
}): Promise<ApprovedSessionUser>
resolveApprovedRiseUser(authUserId: string): Promise<ApprovedSessionUser>
```

### 4.2 Signing Edge Function

`POST /functions/v1/committee-report-sign`

```json
{
  "action": "request",
  "snapshotId": "uuid",
  "unsignedObjectPath": "meeting/snapshot/request.pdf",
  "padesProfile": "B-T"
}
```

Response:

```json
{
  "signatureId": "uuid",
  "status": "signed",
  "signedSha256": "hex",
  "certificateFingerprint": "hex",
  "timestampAt": "ISO-8601"
}
```

`action: "status"`는 본인 권한 범위의 상태만 반환하고 provider 원문 오류나 secret을 노출하지 않는다. 같은 snapshot/digest/profile 요청은 idempotency key로 중복 서명을 방지한다.

## 5. Implementation Plan

### 5.1 Planned Files

| Area | Files |
|---|---|
| TypeScript | `anchor-dashboard/tsconfig.json`, existing `.ts/.tsx` batches |
| Lint | `anchor-dashboard/package.json`, `.oxlintrc.json`, existing source batches |
| Bundle | `anchor-dashboard/src/App.tsx`, `vite.config.js`, feature import sites |
| Auth | `src/services/auth-service.ts`, `src/components/AuthManager.tsx`, env example |
| Signing | migration, `supabase/functions/committee-report-sign/index.ts`, report client adapter |
| Tests | auth service tests, signing validation tests, existing committee tests |

File names follow the existing project structure where renaming would cause broad diffs. New non-component files use kebab-case.

### 5.2 Implementation Order

1. TypeScript 7 configuration blockers
2. actual TypeScript baseline and error batches until zero
3. correctness lint, safe cleanup, accessibility batches
4. lazy feature/import boundaries and measured build
5. shared approved-profile resolver
6. email OTP adapter and configured environment E2E
7. SMS OTP adapter and provider preflight/E2E
8. signature schema/storage/RLS
9. provider-neutral server signing adapter
10. chosen certificate provider/TSA integration and PAdES validation

Each step is an independent commit candidate. A failed gate blocks only the following workstream, not the current production path.

## 6. Test Plan

### 6.1 Static and Build

- `npx tsc --noEmit --pretty false`
- `npm run lint`
- oxlint with React and JSX a11y plugins
- `npm run build`
- bundle artifact size comparison
- JSX/class/style diff audit for touched UI files

### 6.2 Authentication

- existing password login and session restoration
- approved email OTP user
- unapproved/missing `rise_users` profile
- email OTP resend cooldown, expiration and invalid token
- valid E.164 SMS OTP, invalid phone, provider unavailable
- OTP request does not create unknown users
- sign-out and refresh after OTP session

### 6.3 Committee and PDF

- existing external vote and report HMAC tests
- malformed/invalidated snapshot cannot be signed
- unauthorized role cannot request or download signature
- unsigned digest mismatch rejects request
- idempotent duplicate request returns existing job
- signed PDF cryptographic validation succeeds
- certificate chain, revocation and TSA validation result is stored
- signed object cannot be overwritten
- provider unavailable never marks the report signed

### 6.4 Visual Regression

- login page, dashboard overview, committee management, external vote, report PDF
- reference viewport screenshots and PDF page renders
- no position, size, wrapping, color or font regression

## 7. Security and Operations

- Supabase anon key만 브라우저에 허용하며 service role은 Edge Function secret으로 제한한다.
- OTP destination은 오류·로그에서 mask 처리한다.
- Auth user enumeration을 방지하도록 요청·검증 오류 문구를 일반화한다.
- DB RLS와 Edge Function role 검증을 모두 통과해야 서명 요청이 가능하다.
- signing provider credential과 key reference는 운영/개발을 분리하고 rotation 가능해야 한다.
- PDF는 최종 렌더 후 서명하며 서명 후 어떤 byte도 수정하지 않는다.
- 인증서 만료·폐기·OCSP/CRL 실패와 TSA 실패를 정상 서명 상태와 구분한다.
- 감사 로그에는 요청자, snapshot, digest, 결과와 안전한 오류 코드만 기록한다.

## 8. Deployment Gates

| Gate | Required Evidence |
|---|---|
| TypeScript | 0 errors |
| Lint/a11y | 0 warnings or zero approved exceptions |
| Bundle | baseline comparison and smoke test |
| Email OTP | custom SMTP/template/rate limit confirmation |
| SMS OTP | provider/sender/cost/country confirmation |
| PAdES | institution certificate, non-exportable key custody, TSA, validator result |

DB migration과 storage/RLS 적용에는 사용자가 허용한 짧은 운영 점검 시간을 사용한다. migration은 additive하게 배포하고, 기존 HMAC 보고서와 비밀번호 로그인을 즉시 rollback 경로로 유지한다.

## 9. External Decisions

구현으로 대체할 수 없는 결정은 다음과 같다.

- SMS provider와 발신 정책
- 이메일 custom SMTP와 발신 도메인
- OTP를 허용할 사용자 범위
- 기관용/개인별 인증서 정책
- HSM/KMS/전자서명 사업자와 TSA
- PAdES profile 및 법적 보존 기간

## 10. References

- Supabase Auth overview: <https://supabase.com/docs/guides/auth>
- Supabase passwordless email: <https://supabase.com/docs/guides/auth/auth-email-passwordless>
- Supabase JavaScript OTP: <https://supabase.com/docs/reference/javascript/auth-signinwithotp>
- Supabase Auth rate limits: <https://supabase.com/docs/guides/auth/rate-limits>
- Supabase email templates: <https://supabase.com/docs/guides/auth/auth-email-templates>
- ETSI EN 319 142-1 V1.2.1, PAdES baseline signatures: <https://www.etsi.org/deliver/etsi_EN/319100_319199/31914201/01.02.01_60/en_31914201v010201p.pdf>
- `docs/02-design/features/committee-vote-stabilization.design.md`
