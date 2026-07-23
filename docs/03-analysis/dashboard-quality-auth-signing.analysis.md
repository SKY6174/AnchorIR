# Gap Analysis: dashboard-quality-auth-signing

> Date: 2026-07-23 | Design: `docs/02-design/features/dashboard-quality-auth-signing.design.md`
> Implementation baseline: `anchor-dashboard` commit `fc8ca1b` | Iteration: 2

---

## Match Rate: 48%

총 42개 검증 항목 중 20개가 구현·검증되었다. TypeScript, 일반 lint, 위원회 회귀시험, 초기 번들 개선과 공통 승인 프로필 resolver가 완료됐다. 반면 JSX 접근성 공식 검사, 이메일·SMS OTP, PAdES 서명 스키마·서버 경계·검증은 구현되지 않았다.

외부 사업자와 인증서가 필요한 항목은 임의 구현하지 않은 것이 설계와 일치하지만, provider 미설정 상태를 안전하게 표현하는 서버 adapter와 데이터 경계까지 아직 없으므로 구현 완료로 계산하지 않았다.

## Evaluation Method

- 설계의 Workstream A~E와 Test/Operations 요구를 42개 독립 항목으로 분해했다.
- 구현 코드, 설정, migration, Edge Function, 테스트 파일이 존재하고 현재 검사로 확인된 항목만 완료로 계산했다.
- 일부 구현 또는 수동 확인만 있는 항목은 완료 점수에 포함하지 않았다.
- 계산식: `20 / 42 × 100 = 47.62%`, 반올림하여 48%.

## Workstream Results

| Workstream | Implemented | Total | Rate | Result |
|---|---:|---:|---:|---|
| A. TypeScript | 5 | 5 | 100% | Match |
| B. Lint and accessibility | 2 | 5 | 40% | Partial |
| C. Bundle and performance | 6 | 7 | 86% | Partial |
| D. Supabase OTP | 4 | 10 | 40% | Partial |
| E. Certificate PDF signature | 1 | 10 | 10% | Missing |
| Tests and operations | 2 | 5 | 40% | Partial |
| **Total** | **20** | **42** | **48%** | **Act required** |

## Implemented Items

### A. TypeScript — 5/5

- [x] TypeScript 7에서 제거된 `baseUrl`을 사용하지 않는다.
- [x] alias target이 `./src/*`로 설정되어 있다.
- [x] `strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch`가 유지된다.
- [x] 애플리케이션 소스를 숨기는 exclude가 추가되지 않았다.
- [x] `npx tsc --noEmit --pretty false`가 오류 0건으로 통과한다.

### B. Lint and accessibility — 2/5

- [x] oxlint React 플러그인과 hook 검사가 공식 설정에 포함된다.
- [x] 현재 `npx oxlint . --format=json` 진단이 0건이다.
- [ ] JSX 접근성 플러그인이 공식 설정에 포함되지 않았다.
- [ ] label/control, accessible name 검사가 JSX 접근성 규칙으로 검증되지 않았다.
- [ ] keyboard/focus 동등성이 JSX 접근성 규칙과 화면 회귀시험으로 검증되지 않았다.

Evidence:

- `anchor-dashboard/.oxlintrc.json`의 plugins는 `react`, `oxc`이며 `jsx-a11y`가 없다.
- 현재 lint 0건은 활성화된 규칙 범위의 결과이지 설계된 접근성 gate 전체의 결과가 아니다.

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

### D. Supabase OTP — 4/10

- [x] 기존 Supabase 비밀번호 로그인과 세션 복원은 유지된다.
- [x] 로그인과 복원 경로에 `rise_users.uuid`, `approved` 확인이 존재한다.
- [x] 로그인과 세션 복원이 공통 `resolveApprovedRiseUser` adapter를 사용한다.
- [x] 알 수 없는 `role_key`는 local 세션 폐기와 일반화된 인증 실패로 처리한다.
- [ ] `signInWithOtp` 이메일 요청 adapter가 없다.
- [ ] `verifyOtp` 이메일 검증 adapter가 없다.
- [ ] E.164 정규화와 SMS OTP 요청 adapter가 없다.
- [ ] SMS OTP 검증 adapter가 없다.
- [ ] 이메일/SMS 기능 flag와 provider preflight가 없다.
- [ ] resend cooldown, 실패 횟수, 일반화된 OTP 오류 처리와 OTP E2E가 없다.

Evidence:

- `anchor-dashboard/src/components/AuthManager.tsx`는 `signInWithPassword`만 사용한다.
- `src/services/auth-service.ts`가 UUID, 승인 여부와 허용 역할을 한 경계에서 검사한다.
- `AuthManager.tsx`와 `App.tsx`가 동일 resolver를 사용하며 unknown role fallback이 제거됐다.
- migration 096은 Auth와 `rise_users`의 DB 계약을 강화했지만 OTP 요청·검증 기능은 제공하지 않는다.

### E. Certificate PDF signature — 1/10

- [x] 기존 위원회 결과 snapshot에 SHA-256과 서버 HMAC 봉인·검증이 유지된다.
- [ ] `committee_report_signatures` migration이 없다.
- [ ] `committee-report-staging`, `committee-signed-reports` private bucket과 정책이 없다.
- [ ] 일반 클라이언트 변경을 차단하는 signature RLS·상태 전이 경계가 없다.
- [ ] `committee-report-sign` Edge Function이 없다.
- [ ] 요청자 역할, snapshot 무효화, unsigned PDF digest 검증이 없다.
- [ ] provider-neutral PAdES adapter가 없다.
- [ ] `provider_not_configured` 안전 실패 경로가 없다.
- [ ] 인증서·알고리즘·TSA·validation audit 저장이 없다.
- [ ] signed PDF immutable 저장과 단기 signed URL 발급이 없다.

Evidence:

- 현재 최신 migration은 099이며 signature 테이블이나 전용 bucket migration이 없다.
- 현재 Supabase Function은 `committee-vote`이며 PAdES signing Function은 없다.
- `CommitteeManager.tsx`는 HMAC 봉인을 명시하지만 PKI/PAdES 상태를 표시하거나 요청하지 않는다.

### Tests and operations — 2/5

- [x] production build가 성공하고 500KB warning이 없다.
- [x] 위원회 표결·정족수 시험 6개가 통과한다.
- [ ] 이메일·SMS OTP adapter 단위시험과 구성된 환경 E2E가 없다.
- [ ] signing 권한·digest·idempotency·PAdES 검증 시험이 없다.
- [ ] 로그인·관리 화면·위원회·PDF의 자동 시각 회귀 기준이 없다.

## Changed Items and Deviations

1. 설계는 JSX element 중첩을 보존하도록 했지만 lazy-loading을 위해 `React.Suspense` 경계가 추가됐다. `fallback={null}`은 렌더 후 DOM을 생성하지 않아 화면 구조와 스타일은 유지되지만, 소스 JSX 중첩은 변경됐다.
2. 접근성 경고 0건으로 보고된 현재 상태는 JSX 접근성 플러그인이 없는 검사 결과다. 따라서 설계의 accessibility exit gate를 충족했다고 볼 수 없다.
3. lazy import 실패는 전역 chunk 오류 감지 후 새로고침으로 대응한다. 명시적인 사용자 재시도 컴포넌트는 없지만 기존 화면 외관 보존 정책과는 일치한다.
4. OTP와 PAdES는 외부 SMTP/SMS provider/인증서/HSM/TSA 결정 전 운영 활성화하면 안 된다. 다만 provider-neutral adapter와 비활성 flag는 외부 결정 전에도 구현 가능하다.

## Risks

| Priority | Gap | Risk |
|---|---|---|
| P0 | PAdES schema·RLS·서버 경계 부재 | 공인 서명 기능을 안전하게 추가할 기반이 없음 |
| P1 | JSX 접근성 gate 미구성 | 접근성 0건이라는 품질 지표가 실제 범위를 반영하지 않음 |
| P1 | OTP abuse control·feature flag 부재 | provider 연결 시 사용자 열거, 비용·재전송 남용 위험 |
| P2 | 자동 시각 회귀 부재 | UI 완전 보존을 정적 diff와 수동 확인에 의존 |

## Recommendations

1. JSX 접근성 플러그인을 공식 lint에 추가하고 UI 변경 없는 attribute/handler 수정만 적용한다.
2. 이메일 OTP adapter와 disabled-by-default feature flag를 구현한 뒤 custom SMTP 환경에서 E2E한다.
3. SMS adapter는 E.164 parser와 provider preflight까지만 구현하고 provider 결정 전 flag를 끈다.
4. additive migration으로 signature audit schema, private bucket, RLS를 먼저 배포한다.
5. provider-neutral signing Edge Function에 `provider_not_configured` 실패 경로를 구현한다.
6. 기관 인증서/HSM/TSA 결정 후 PAdES-B-T 통합과 독립 validator 검증을 수행한다.
7. 로그인, 주요 lazy 탭, 위원회 외부표결, 결과보고서 PDF에 시각 회귀 기준을 추가한다.

## Next Steps

- [x] Act 1: 승인 프로필 resolver 통합과 unknown role fail-closed
- [ ] Act 2: JSX 접근성 검사 gate 정상화
- [ ] Act 3: 이메일 OTP adapter·feature flag·시험
- [ ] Act 4: SMS OTP adapter·provider preflight·시험
- [ ] Act 5: signature schema/storage/RLS migration
- [ ] Act 6: provider-neutral signing Function과 client adapter
- [ ] Act 7: 외부 인증서/TSA 결정 후 PAdES 검증
- [ ] 각 Act batch 후 TypeScript, lint, build, 위원회 시험과 UI diff audit

현재 match rate가 90% 미만이므로 Report로 진행하지 않고 Act 단계에서 격차를 순서대로 수정한다.
