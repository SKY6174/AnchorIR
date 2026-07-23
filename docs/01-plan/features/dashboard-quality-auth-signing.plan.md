# dashboard-quality-auth-signing - Plan Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved for design
> Level: Dynamic

---

## 1. Overview

### 1.1 Purpose

기존 앵커사업 대시보드의 JSX 구조, CSS 클래스, 표시 문자열과 화면 레이아웃을 보존하면서 다음 후순위 작업을 운영 가능한 순서로 완료한다.

1. 전체 TypeScript 검사 정상화와 오류 제거
2. 전체 lint 및 접근성 경고 제거
3. route/feature 단위 번들 분할과 초기 로딩 성능 개선
4. Supabase Auth 기반 이메일·SMS OTP 인증
5. 공인 인증서 기반 PDF 전자서명을 위한 서버 서명 경계 구축

### 1.2 Background

위원회 의결·PDF 안정화의 핵심 작업이 완료되어 기술 부채와 인증·서명 고도화를 시작할 수 있다. 과거 보고된 TypeScript 오류 수는 3,573개였으나 현재 TypeScript 7 기준 검사는 제거된 `baseUrl`과 잘못된 alias 설정 2건에서 먼저 중단된다. 이 설정을 정상화해야 실제 코드 오류 기준선을 얻을 수 있다.

현재 기본 oxlint 기준은 경고 424건이며, React와 JSX 접근성 플러그인을 활성화하면 경고 970건이다. 프로덕션 번들의 메인 JavaScript는 약 3.9MB(gzip 약 944KB)이고, `CommitteeExternalVote` 외 대부분의 화면이 `App.tsx` 정적 import 경계에 묶여 있다.

현재 로그인은 Supabase 비밀번호 인증이며 OTP UI는 없다. PDF는 SHA-256과 서버 HMAC으로 기록 무결성을 검증하지만 공인 인증서의 개인키로 서명된 PAdES 문서는 아니다.

## 2. Baseline

| Area | Current Baseline |
|---|---:|
| TypeScript config blockers | 2 (`TS5102`, `TS5090`) |
| Historical TypeScript errors | 3,573 reported before current config block |
| Default oxlint warnings | 424 |
| React + JSX a11y warnings | 970 |
| Main production JS | 3,903.16KB, gzip 943.66KB |
| Existing lazy feature chunks | `CommitteeExternalVote`, `pressAnalyzer` |
| Auth | Supabase password session |
| PDF integrity | SHA-256 + server HMAC, non-PKI |

## 3. Delivery Workstreams

### 3.1 Workstream A - TypeScript

- TypeScript 7과 호환되는 alias 설정으로 검사 차단 오류를 제거한다.
- 전체 오류를 코드·파일·패턴별로 분류한다.
- `any`를 일괄 치환하지 않고 시스템 경계부터 명시 타입을 적용한다.
- 데이터베이스 행, 컴포넌트 props, 이벤트, nullable 상태, 외부 라이브러리 타입을 우선한다.
- UI JSX와 스타일 구간은 타입 수정을 이유로 재구성하지 않는다.

### 3.2 Workstream B - Lint and Accessibility

- oxlint의 React와 JSX a11y 플러그인을 공식 검사에 포함한다.
- 자동 수정은 안전한 unused import와 불필요 escape에 한정한다.
- hook dependency, duplicate key, constant expression은 동작 검토 후 수동 수정한다.
- label/control 연결, 키보드 이벤트, accessible name, media caption을 보강한다.
- DOM 구조를 바꾸지 않고 기존 태그의 attribute와 handler 경계에서 우선 해결한다.

### 3.3 Workstream C - Bundle and Performance

- 대형 관리 화면을 `React.lazy`와 `Suspense` 경계로 분리한다.
- `xlsx`, PDF, AI, 차트 등 대형 라이브러리는 사용 기능 진입 시 동적 import한다.
- Vite chunk 구성을 기능 단위로 안정화한다.
- 초기 메인 gzip 크기와 build warning을 기준선보다 낮춘다.
- 기능 전환, 로그인 복원, PDF 생성에 회귀가 없어야 한다.

### 3.4 Workstream D - Supabase OTP

- 기존 Supabase Auth 세션과 `rise_users.uuid = auth.uid()` 권한 계약을 유지한다.
- 이메일 OTP와 SMS OTP 요청·검증 adapter를 분리한다.
- OTP 원문, provider secret, service role key는 브라우저나 업무 테이블에 저장하지 않는다.
- 요청 빈도 제한, 만료, 재전송 대기, 일반화된 오류 메시지를 적용한다.
- SMS provider와 발신 설정이 없는 환경에서는 이메일 OTP만 활성화하고 SMS는 명시적 비활성 상태로 둔다.

### 3.5 Workstream E - Certificate PDF Signature

- 기존 HMAC 봉인은 계속 유지하며 공인 인증서 서명과 의미를 구분한다.
- 개인키와 인증서 체인은 서버 또는 전용 서명 사업자/HSM 경계에만 둔다.
- PDF 생성 후 PAdES 서명 서비스에 digest 또는 PDF를 전달하고 서명된 PDF를 private Storage에 저장한다.
- 인증서 주체, serial, issuer, 서명 시각, 알고리즘, TSA 결과를 감사 데이터로 보관한다.
- 실제 공인 서명은 기관 인증서, 개인키 보관 방식, TSA 및 서명 사업자가 확정된 뒤 운영 활성화한다.

## 4. Non-Goals

- UI 디자인 개편 또는 레이아웃 재배치
- 모든 `any`의 기계적 제거
- SMS 사업자 계약 또는 비용 결제 대행
- 기관 공인 인증서 발급·갱신 대행
- 클라이언트에 개인키 또는 인증서 비밀번호 저장
- HMAC 봉인을 공인전자서명으로 표시
- 인증서 없이 공인 서명 완료로 가장하는 fallback

## 5. Execution Order and Gates

| Order | Workstream | Entry Gate | Exit Gate |
|---:|---|---|---|
| 1 | TypeScript config and errors | 현재 build 통과 | `tsc --noEmit` 0 errors |
| 2 | Lint correctness | TypeScript 0 | default oxlint 0 warnings |
| 3 | Accessibility | lint correctness 0 | JSX a11y 0 warnings 또는 승인된 예외 0 |
| 4 | Bundle | 기능 회귀 시험 가능 | 초기 gzip 감소, chunk warning 해소 |
| 5 | Email OTP | Supabase Auth 계약 유지 | 요청·검증·세션 복원 E2E 통과 |
| 6 | SMS OTP | provider 설정 완료 | 요청·검증·rate-limit E2E 통과 |
| 7 | PKI PDF | 인증서/HSM/TSA 결정 | PAdES 검증과 감사 E2E 통과 |

각 gate를 통과하기 전 다음 단계의 운영 배포를 섞지 않는다. 코드 변경은 작은 커밋으로 분리하고 매 단계 build·핵심 회귀시험을 실행한다.

## 6. Success Criteria

- [ ] TypeScript 설정 차단 오류 0건
- [ ] 전체 `tsc --noEmit` 오류 0건
- [ ] default oxlint 경고 0건
- [ ] React + JSX a11y 경고 0건
- [ ] 기존 JSX 구조·className·인라인 style의 의도하지 않은 변경 0건
- [ ] 메인 bundle 500KB warning 해소 또는 근거 있는 예외 0건
- [ ] 주요 기능 lazy chunk와 실패 fallback 동작
- [ ] 이메일 OTP 요청·검증·세션 복원 성공
- [ ] SMS OTP 요청·검증·rate limit 성공
- [ ] OTP secret·token·provider key 클라이언트 노출 0건
- [ ] 공인 인증서 개인키 브라우저 노출 0건
- [ ] PAdES 서명 검증 성공 및 인증서/TSA 감사정보 저장
- [ ] HMAC-only 문서와 PKI 서명 문서의 표시·검증 의미 구분
- [ ] production build와 위원회 핵심 시험 통과

## 7. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| TypeScript 설정 복구 후 대량 오류 재노출 | High | High | 오류 코드·파일군별 batch, 작은 커밋, build 병행 |
| unused 제거가 동적 참조를 손상 | High | Medium | 자동 수정 범위 제한, 기능별 smoke test |
| 접근성 수정이 DOM/레이아웃 변경 | High | Medium | attribute/handler 우선, 시각 snapshot 비교 |
| lazy import로 화면 전환 실패 | High | Medium | 공통 Suspense와 error boundary, 주요 탭 E2E |
| SMS provider 미설정 또는 발신 제한 | High | High | feature flag와 이메일 OTP 우선, provider preflight |
| OTP abuse와 비용 증가 | High | Medium | Supabase rate limit, resend cooldown, CAPTCHA/provider 보호 |
| 인증서 개인키 유출 | Critical | Low | HSM/KMS/서명 사업자, non-exportable key, 서버 전용 접근 |
| PAdES 문서가 법적 요구와 불일치 | Critical | Medium | 기관 정책·서명 사업자·법무 확인 후 운영 활성화 |
| PDF 서명 후 문서 변경 | Critical | Medium | PDF 최종 렌더 후 서명, 서명 후 immutable storage |

## 8. External Decisions Required

아래 결정은 코드에서 임의 선택하지 않는다.

- SMS provider, 발신번호, 비용 한도, 운영 국가
- OTP 로그인 허용 사용자와 계정 복구 정책
- 기관용 인증서 또는 개인별 인증서 사용 여부
- 개인키 보관: 기관 HSM/KMS 또는 공인 전자서명 사업자
- TSA 사용 여부와 장기검증 프로파일(PAdES-B-T/B-LT/B-LTA)
- 서명된 PDF의 법적 보존기간과 폐기 정책

## 9. Schedule

| Phase | Scope | Status |
|---|---|---|
| Plan | 기준선·작업 분리·외부 결정 식별 | Complete |
| Design | 타입/lint/bundle/Auth/PAdES 상세 설계 | In Progress |
| Do A | TypeScript 0 errors | Pending |
| Do B | lint/a11y 0 warnings | Pending |
| Do C | bundle optimization | Pending |
| Do D | email/SMS OTP | Pending |
| Do E | PKI PDF signing | Pending |
| Check | build, E2E, security, PDF validation | Pending |
| Report | 완료·외부 의존성·운영 인계 | Pending |

## 10. References

- `anchor-dashboard/tsconfig.json`
- `anchor-dashboard/vite.config.js`
- `anchor-dashboard/src/App.tsx`
- `anchor-dashboard/src/components/AuthManager.tsx`
- `anchor-dashboard/src/components/CommitteeManager.tsx`
- `supabase/functions/committee-vote/index.ts`
- `docs/02-design/features/committee-vote-stabilization.design.md`
- Supabase Auth OTP official documentation
- ETSI PAdES and trusted timestamp standards
- 대한민국 전자서명 관련 법령 및 기관 기록관리 정책
