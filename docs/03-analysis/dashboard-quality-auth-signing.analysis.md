# Gap Analysis: dashboard-quality-auth-signing

> Date: 2026-07-23 | Design: `docs/02-design/features/dashboard-quality-auth-signing.design.md`
> Implementation baseline: `anchor-dashboard` commit `4f5d7dd` + current accessibility batch | Iteration: 3

---

## Match Rate: 86%

총 42개 검증 항목 중 36개가 구현·검증되었다. TypeScript, JSX 접근성 lint, 위원회 회귀시험, 초기 번들 개선, 공통 승인 프로필 resolver, provider-neutral OTP와 PAdES 서버 경계가 완료됐다. 운영 SMTP/SMS E2E, 실제 인증서/HSM/TSA provider adapter, 자동 시각 회귀는 아직 남아 있다.

외부 사업자와 인증서가 필요한 항목은 임의 구현하지 않은 것이 설계와 일치하지만, provider 미설정 상태를 안전하게 표현하는 서버 adapter와 데이터 경계까지 아직 없으므로 구현 완료로 계산하지 않았다.

## Evaluation Method

- 설계의 Workstream A~E와 Test/Operations 요구를 42개 독립 항목으로 분해했다.
- 구현 코드, 설정, migration, Edge Function, 테스트 파일이 존재하고 현재 검사로 확인된 항목만 완료로 계산했다.
- 일부 구현 또는 수동 확인만 있는 항목은 완료 점수에 포함하지 않았다.
- 계산식: `36 / 42 × 100 = 85.71%`, 반올림하여 86%.

## Workstream Results

| Workstream | Implemented | Total | Rate | Result |
|---|---:|---:|---:|---|
| A. TypeScript | 5 | 5 | 100% | Match |
| B. Lint and accessibility | 5 | 5 | 100% | Match |
| C. Bundle and performance | 6 | 7 | 86% | Partial |
| D. Supabase OTP | 9 | 10 | 90% | Partial |
| E. Certificate PDF signature | 9 | 10 | 90% | Partial |
| Tests and operations | 2 | 5 | 40% | Partial |
| **Total** | **36** | **42** | **86%** | **Act required** |

## Implemented Items

### A. TypeScript — 5/5

- [x] TypeScript 7에서 제거된 `baseUrl`을 사용하지 않는다.
- [x] alias target이 `./src/*`로 설정되어 있다.
- [x] `strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch`가 유지된다.
- [x] 애플리케이션 소스를 숨기는 exclude가 추가되지 않았다.
- [x] `npx tsc --noEmit --pretty false`가 오류 0건으로 통과한다.

### B. Lint and accessibility — 5/5

- [x] oxlint React 플러그인과 hook 검사가 공식 설정에 포함된다.
- [x] 현재 `npx oxlint . --format=json` 진단이 0건이다.
- [x] JSX 접근성 플러그인이 공식 설정에 포함된다.
- [x] label/control과 accessible name이 JSX 접근성 규칙으로 검증된다.
- [x] clickable element의 Enter/Space 동작과 mouse/focus 동등성이 정적 검사와 build로 검증된다.

Evidence:

- `anchor-dashboard/.oxlintrc.json`의 plugins에 `jsx-a11y`가 포함된다.
- `control-has-associated-label`은 복합 표 구조를 검사하도록 공식 옵션 `depth: 10`을 사용한다.
- `prefer-tag-over-role`은 JSX element 종류를 바꾸지 않는 UI 보존 계약 때문에 끄고, 해당 element에는 role, tabIndex, Enter/Space handler를 함께 적용한다.
- 업로드된 위원회 음성 파일에는 현재 caption asset/URL 데이터 모델이 없으므로 `media-has-caption`은 가짜 track을 생성하지 않고 예외 처리한다. 자막 데이터 모델이 추가되면 이 예외를 제거해야 한다.
- `npx oxlint . --format=unix`, `npx tsc --noEmit`, production build와 위원회 시험 6건이 모두 통과한다.

### C. Bundle and performance — 6/7

- [x] 대형 관리 화면 13개가 `React.lazy` 경계로 분리됐다.
- [x] Sidebar, KPIOverview, AuthManager는 eager import를 유지한다.
- [x] XLSX는 실제 다운로드·업로드 handler에서 동적 import된다.
- [x] `Suspense fallback={null}`로 새 시각 레이아웃을 만들지 않는다.
- [x] Vite 8 Rolldown chunk group이 안정적인 라이브러리군으로 구성됐다.
- [x] 초기 entry와 preload가 감소했고 500KB build warning이 해소됐다.
- [ ] PDF·chart 라이브러리가 모두 실제 기능 handler 경계로 이동하지 않았다.

Measured evidence:

- 초기 entry: 약 3,907KB에서 약 381KB로 감소.
- 초기 entry gzip: 약 945KB에서 약 78KB로 감소.
- XLSX 변경 직전 preload 3,674,350B에서 변경 후 3,227,603B로 446,747B 감소.
- spreadsheet chunk는 production HTML preload 목록에서 제거됐다.
- 최대 생성 chunk는 약 425KB로 500KB 미만이다.
- Rolldown `strictExecutionOrder`로 Recharts/D3 분할 청크의 source execution order를 보존한다.
- production preview에서 외부위원 로그인과 일반 로그인 모두 runtime exception 0건으로 확인했다.

### D. Supabase OTP — 9/10

- [x] 기존 Supabase 비밀번호 로그인과 세션 복원은 유지된다.
- [x] 로그인과 복원 경로에 `rise_users.uuid`, `approved` 확인이 존재한다.
- [x] 로그인과 세션 복원이 공통 `resolveApprovedRiseUser` adapter를 사용한다.
- [x] 알 수 없는 `role_key`는 local 세션 폐기와 일반화된 인증 실패로 처리한다.
- [x] `signInWithOtp` 이메일 요청 adapter가 있다.
- [x] `verifyOtp` 이메일 검증 adapter가 있다.
- [x] E.164 정규화와 SMS OTP 요청 adapter가 있다.
- [x] SMS OTP 검증 adapter가 있다.
- [x] 이메일/SMS 기능 flag와 provider preflight가 있다.
- [ ] resend cooldown, 실패 횟수와 일반화된 OTP 오류 처리는 구현됐으나 구성된 운영 provider OTP E2E가 없다.

Evidence:

- `anchor-dashboard/src/components/AuthManager.tsx`는 `signInWithPassword`만 사용한다.
- `src/services/auth-service.ts`가 UUID, 승인 여부와 허용 역할을 한 경계에서 검사한다.
- `AuthManager.tsx`, `App.tsx`와 OTP adapter가 동일 resolver를 사용하며 unknown role fallback이 제거됐다.
- migration 096은 Auth와 `rise_users`의 DB 계약을 강화했지만 OTP 요청·검증 기능은 제공하지 않는다.
- `otp-auth-core.ts`는 email/SMS 요청·검증, `shouldCreateUser: false`, E.164, destination mask, cooldown과 실패 한도를 provider-neutral 경계로 제공한다.
- feature flag와 provider readiness flag는 모두 기본 false이며 UI에는 아직 연결되지 않는다.
- OTP 단위시험 6건이 통과한다. 운영 SMTP/SMS provider 구성 환경 E2E가 없으므로 마지막 항목은 완료로 계산하지 않았다.

### E. Certificate PDF signature — 9/10

- [x] 기존 위원회 결과 snapshot에 SHA-256과 서버 HMAC 봉인·검증이 유지된다.
- [x] `committee_report_signatures` additive migration이 있다.
- [x] `committee-report-staging`, `committee-signed-reports` private bucket이 있다.
- [x] 일반 클라이언트 변경을 차단하는 signature RLS·상태 전이 경계가 있다.
- [x] `committee-report-sign` Edge Function이 있다.
- [x] 요청자 역할, snapshot 무효화, object path와 unsigned PDF digest를 검증한다.
- [ ] provider-neutral interface는 있으나 승인된 HSM/서명 사업자의 concrete PAdES adapter는 없다.
- [x] `provider_not_configured` 안전 실패 경로가 있다.
- [x] 인증서·알고리즘·TSA·validation audit 저장 필드와 상태 응답이 있다.
- [x] signed PDF immutable private 저장 경계와 5분 signed URL 발급 경로가 있다.

Evidence:

- migration 100은 signature audit table, service-role-only request RPC, RLS, update guard와 두 private bucket을 추가한다.
- `committee-report-sign`은 승인 역할, invalidated snapshot, PDF magic bytes, SHA-256, 경로를 검사한다.
- client signing service와 Edge Function 모두 기본 비활성이고 provider가 없으면 `provider_not_configured`로 종료한다.
- signing core 단위시험 5건과 적용 후 catalog를 점검하는 `committee-signing-verification.sql`이 있다.
- migration 100은 아직 운영 DB에 적용하지 않았으며 Edge Function도 배포하지 않았다.
- `CommitteeManager.tsx`는 기존 HMAC PDF 흐름만 사용하므로 현재 UI와 결과보고서 출력은 변하지 않는다.

### Tests and operations — 2/5

- [x] production build가 성공하고 500KB warning이 없다.
- [x] 위원회 표결·정족수 시험 6개가 통과한다.
- [ ] 이메일·SMS OTP adapter 단위시험과 구성된 환경 E2E가 없다.
- [ ] client의 profile·digest·path·provider 안전 실패 단위시험은 있으나, 적용 DB의 권한·idempotency와 실제 PAdES 독립 검증 시험은 없다.
- [ ] 로그인·관리 화면·위원회·PDF의 자동 시각 회귀 기준이 없다.

## Changed Items and Deviations

1. 설계는 JSX element 중첩을 보존하도록 했지만 lazy-loading을 위해 `React.Suspense` 경계가 추가됐다. `fallback={null}`은 렌더 후 DOM을 생성하지 않아 화면 구조와 스타일은 유지되지만, 소스 JSX 중첩은 변경됐다.
2. 접근성 gate는 공식 JSX 접근성 플러그인 기준 0건이다. 다만 음성 자막 규칙은 caption asset 부재로 명시적 예외이며, 자막 데이터 계약을 추가할 때 다시 활성화해야 한다.
3. lazy import 실패는 전역 chunk 오류 감지 후 새로고침으로 대응한다. 명시적인 사용자 재시도 컴포넌트는 없지만 기존 화면 외관 보존 정책과는 일치한다.
4. OTP와 PAdES는 외부 SMTP/SMS provider/인증서/HSM/TSA 결정 전 운영 활성화하면 안 된다. 다만 provider-neutral adapter와 비활성 flag는 외부 결정 전에도 구현 가능하다.

## Risks

| Priority | Gap | Risk |
|---|---|---|
| P0 | 승인된 PAdES provider/HSM/TSA 미결정 | 실제 공인 서명과 독립 검증을 활성화할 수 없음 |
| P1 | OTP abuse control·feature flag 부재 | provider 연결 시 사용자 열거, 비용·재전송 남용 위험 |
| P2 | 자동 시각 회귀 부재 | UI 완전 보존을 정적 diff와 수동 확인에 의존 |
| P2 | 음성 자막 데이터 계약 부재 | 녹음 재생은 가능하지만 청각 접근성 대체 수단이 없음 |

## Recommendations

1. 이메일 OTP adapter와 disabled-by-default feature flag를 구현한 뒤 custom SMTP 환경에서 E2E한다.
2. SMS adapter는 E.164 parser와 provider preflight까지만 구현하고 provider 결정 전 flag를 끈다.
3. additive migration으로 signature audit schema, private bucket, RLS를 먼저 배포한다.
4. provider-neutral signing Edge Function에 `provider_not_configured` 실패 경로를 구현한다.
5. 기관 인증서/HSM/TSA 결정 후 PAdES-B-T 통합과 독립 validator 검증을 수행한다.
6. 로그인, 주요 lazy 탭, 위원회 외부표결, 결과보고서 PDF에 시각 회귀 기준을 추가한다.
7. 음성 녹음 caption URL 또는 transcript 데이터 계약을 추가한 뒤 `media-has-caption` 규칙을 재활성화한다.

## Next Steps

- [x] Act 1: 승인 프로필 resolver 통합과 unknown role fail-closed
- [x] Act 2: JSX 접근성 검사 gate 정상화
- [x] Act 3: 이메일 OTP adapter·feature flag·단위시험
- [x] Act 4: SMS OTP adapter·provider preflight·단위시험
- [x] Act 5: signature schema/storage/RLS migration 작성
- [x] Act 6: provider-neutral signing Function과 client adapter
- [ ] Act 7: 외부 인증서/TSA 결정 후 PAdES 검증
- [ ] 각 Act batch 후 TypeScript, lint, build, 위원회 시험과 UI diff audit

현재 match rate가 90% 미만이므로 Report로 진행하지 않고 Act 단계에서 격차를 순서대로 수정한다.
