# Dashboard Quality, Auth and Signing — Implementation Report

> Date: 2026-07-23
> Scope: TypeScript, lint/accessibility, bundle stability, OTP boundary, PAdES signing boundary
> UI contract: existing visual layout, class names and inline visual styles preserved

## Outcome

내부 코드와 로컬 검증으로 완료할 수 있는 항목은 모두 구현했다. TypeScript와 JSX 접근성 lint는 0건이며, 위원회 핵심 시험을 포함한 자동 시험 18건과 production build가 통과한다. OTP와 PAdES는 기존 UI에 연결하지 않고 기본 비활성 상태로 추가했다.

현재 설계 일치율은 86%다. 남은 14%는 운영 SMTP/SMS provider E2E, 기관 인증서/HSM/TSA 기반 실제 PAdES adapter와 독립 검증, 자동 시각 회귀 기반이다.

## Completed Work

| Area | Result |
|---|---|
| TypeScript | strict 설정을 유지한 전체 `tsc --noEmit` 오류 0건 |
| Lint/accessibility | React + jsx-a11y 공식 gate 0건 |
| UI interaction | label 연결, accessible name, Enter/Space, hover/focus 동등성 보강 |
| Bundle | 500KB 초과 warning 제거, Recharts 실행 순서 안정화, production preview 정상 |
| Auth contract | Supabase Auth와 승인된 `rise_users.uuid` resolver 통합 |
| OTP | email/SMS adapter, E.164, `shouldCreateUser: false`, cooldown, 실패 제한, provider preflight |
| PAdES infrastructure | migration 100, private buckets, RLS, service-only RPC, Edge Function, client adapter |
| Signing safety | role/snapshot/path/PDF/digest 검증, immutable signed path, audit metadata, 5분 URL |
| Regression tests | 위원회 6 + OTP 6 + signing 6 = 18건 통과 |

## Commits

- `1ed4975` — chart chunk execution order
- `3bd339b` — label/control association
- `4f5d7dd` — hover/focus equivalence
- `d345805` — keyboard/accessibility gate
- `edc777c` — disabled-by-default OTP boundary
- `cc120fb` — guarded PAdES signing boundary

## Verification

```text
npx tsc --noEmit --pretty false        PASS
npm run lint -- --format=unix          PASS (0 diagnostics)
npm run test:committee                 PASS (18/18)
npm run build                          PASS
production preview HTTP/assets         PASS
```

브라우저 자동 연결은 마지막 재검증 시 Codex 브라우저 런타임 자산 오류로 실행하지 못했다. 다만 같은 날 앞선 production 브라우저 검사에서 외부위원 로그인과 일반 로그인은 runtime exception 0건이었고, 이후 UI 변경은 비시각적 접근성 속성뿐이다.

## Production Changes Not Yet Applied

다음 항목은 코드에는 준비됐지만 운영 환경에는 적용하지 않았다.

1. `supabase/migrations/100_create_committee_report_signatures.sql`
2. `supabase/functions/committee-report-sign/index.ts` 배포
3. `supabase/tests/committee-signing-verification.sql` 실행
4. email custom SMTP와 OTP template/rate limit 확인
5. SMS provider/sender/country/cost limit 확인
6. 기관 인증서, non-exportable HSM/KMS, TSA와 독립 PAdES validator 결정

## Safe Production Sequence

1. 짧은 점검 시간에 migration 100을 적용한다.
2. catalog verification SQL을 실행하고 RLS·권한·비공개 bucket을 확인한다.
3. signing Edge Function을 배포하되 `COMMITTEE_PADES_PROVIDER`는 비워 둔다.
4. `provider_not_configured` 응답과 기존 HMAC PDF 출력을 확인한다.
5. 승인된 provider adapter와 secrets를 별도 변경으로 배포한다.
6. 실제 서명 PDF의 certificate chain, revocation, TSA와 byte-level 검증을 독립 도구로 확인한다.
7. 검증 완료 후에만 `VITE_ENABLE_PADES_SIGNING`과 `VITE_PADES_PROVIDER_READY`를 활성화한다.
8. OTP도 provider별 E2E 완료 후 해당 두 readiness flag를 함께 활성화한다.

## Rollback

- OTP/PAdES feature flag를 false로 유지하면 기존 비밀번호 로그인과 HMAC PDF 흐름만 사용한다.
- migration 100은 additive이며 기존 위원회 snapshot과 PDF 생성 테이블을 변경하지 않는다.
- Edge Function 장애나 provider 미설정은 기존 결과보고서 출력을 차단하지 않는다.

## Remaining External Gates

- Email: custom SMTP, 발신 도메인, OTP template, rate limit
- SMS: provider, 발신자, 허용 국가, 비용·fraud limit
- PAdES: 기관 인증서 정책, HSM/KMS 또는 사업자, TSA, 보존 profile
- QA: 고정 viewport 자동 screenshot/PDF pixel diff 환경

이 외부 조건이 확정되기 전에는 “SMS 인증 완료” 또는 “공인 전자서명 완료”로 표시해서는 안 된다.
