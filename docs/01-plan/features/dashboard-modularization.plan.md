# dashboard-modularization - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

---

## 1. Overview

### 1.1 Purpose

앵커사업 대시보드의 대형 TypeScript/TSX 파일을 기능·상태 책임별 모듈로 단계적으로 분리한다. JSX DOM, className, inline style, 표시 문자열, Supabase 호출 결과와 사용자 동작은 그대로 보존한다.

### 1.2 Background

- `App.tsx`: 14,462줄
- `mockData.ts`: 18,812줄
- `ScheduleManager.tsx`: 9,477줄
- `ProcurementManager.tsx`: 7,707줄
- `CommitteeManager.tsx`: 4,539줄
- `PDCAManager.tsx`: 3,664줄
- `SatisfactionManager.tsx`: 3,414줄

파일 규모와 상태·effect·handler 결합도가 높아 변경 충돌, 회귀 분석, 테스트와 코드 검토 비용이 증가했다. 폴더만 나누는 방식이 아니라 데이터, 순수 계산, 서버 통신, 상태 수명주기, 화면 조립 책임을 분리한다.

## 2. Goals

### 2.1 Primary Goals

- [ ] 기존 import 계약을 유지하며 `mockData.ts`를 연차·도메인 모듈로 분리한다.
- [ ] `App.tsx`를 인증·레이아웃·최상위 탭 조립 책임으로 축소한다.
- [ ] Supabase 조회·저장과 상태 복원·자동 저장을 feature service/hook으로 이동한다.
- [ ] 대형 manager를 독립 기능 화면과 순수 utility로 분리한다.
- [ ] 각 단계가 독립적으로 TypeScript, lint, 테스트와 production build를 통과한다.
- [ ] 외부위원 표결·PDF 결과보고서 흐름은 별도 회귀 gate로 보호한다.

### 2.2 Non-Goals

- 화면 디자인, className, inline style, 표시 문구 변경
- DB schema, RLS, API payload와 인증 방식 변경
- 기능 추가 또는 데이터 정리
- 대규모 상태관리 라이브러리 도입
- 무조건적인 barrel export 또는 디렉터리 깊이 증가

## 3. Scope

### 3.1 In Scope

1. 데이터 상수와 타입 분리
2. 순수 계산·format/normalization utility 분리
3. Supabase service 분리
4. feature hook 분리
5. 탭 화면의 1:1 JSX 이동
6. Schedule, Procurement, Satisfaction, PDCA manager 분리
7. Committee manager의 마지막 단계 분리
8. lazy boundary와 bundle 영향 측정

### 3.2 Out of Scope

- 운영 migration 실행
- OTP/PAdES provider 활성화
- CSS 재작성 또는 디자인 시스템 교체
- 모든 기존 `any` 일괄 제거

## 4. Success Criteria

- [ ] JSX 이동 전후 실제 DOM element 종류·순서·조건부 표시가 동일하다.
- [ ] 기존 className과 inline visual style diff가 없다.
- [ ] `npx tsc --noEmit --pretty false`가 통과한다.
- [ ] `npm run lint -- --format=unix`가 진단 0건이다.
- [ ] `npm run test:committee`가 전부 통과한다.
- [ ] `npm run build`가 성공하고 500KB warning이 없다.
- [ ] 각 단계는 독립 커밋이며 기존 기능으로 되돌릴 수 있다.
- [ ] 사용자 소유 dirty file과 운영 임시 파일을 커밋하지 않는다.

## 5. Implementation Batches

| Batch | Scope | Risk |
|---|---|---|
| 1 | `mockData.ts` export-preserving 데이터 분리 | Low |
| 2 | `App.tsx` 타입·상수·순수 함수 | Low |
| 3 | `App.tsx` Supabase service | Medium |
| 4 | 자동 저장·복원·인증 hook | Medium |
| 5 | App 탭별 화면 1:1 이동 | High |
| 6 | Schedule 도메인 분리 | High |
| 7 | Procurement 도메인 분리 | Medium-high |
| 8 | Satisfaction/PDCA 분리 | Medium-high |
| 9 | Committee 회귀시험 강화 후 분리 | High |
| 10 | 전체 회귀·bundle·보고서 | Medium |

## 6. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| JSX 이동으로 DOM 변경 | High | Medium | wrapper 추가 금지, Fragment 또는 기존 root 재사용 |
| 상태 closure 변경 | High | High | 화면보다 순수 함수/service부터 이동하고 props 계약을 명시 |
| 순환 import | High | Medium | feature→shared/data 단방향 의존 규칙 |
| 데이터 객체 참조 변경 | High | Medium | 값 재생성 없이 원본 literal을 그대로 이동하고 facade re-export |
| 자동 저장 순서 변경 | High | Medium | effect dependency와 호출 순서를 변경하지 않는 1:1 이동 |
| 위원회 표결 회귀 | Critical | Low | 마지막 단계 처리, 표결·정족수 시험을 선행·후행 실행 |
| 사용자 변경 덮어쓰기 | High | Low | dirty 파일 제외, 명시적 경로만 stage |

## 7. References

- `docs/02-design/features/dashboard-quality-auth-signing.design.md`
- `docs/02-design/features/committee-vote-stabilization.design.md`
- `docs/02-design/features/committee-external-login-redesign.design.md`
- `docs/03-analysis/dashboard-quality-auth-signing.analysis.md`
