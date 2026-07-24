# Gap Analysis: dashboard-modularization

> Date: 2026-07-24
> Design: `docs/02-design/features/dashboard-modularization.design.md`
> Implementation range: `1a504fb` through `12a7069`

## Match Rate: 92%

설계의 핵심 목표인 호환 facade, App 책임 축소, 기능별 service/hook/screen 경계,
대형 manager 순차 분리, 위원회 마지막 분리, 품질 gate 및 bundle 검증을 완료했다.
총 25개 검증 항목 중 23개를 충족했고 2개는 부분 충족으로 평가했다.

계산식:

```text
(완전 충족 23 + 부분 충족 2 × 0) / 25 × 100 = 92%
```

부분 충족 항목은 기능 결함이 아니라 추가 구조 개선 및 자동화 여지다.

## Design-to-Implementation Matrix

| Area | Result | Evidence |
|---|---|---|
| 기존 `mockData.ts` import 계약 | 충족 | 6줄 facade와 `mock-data/*` 14개 모듈 |
| 정적 데이터 값·순서·identity | 충족 | 직렬화 323,982 bytes exact match, 명시적 aggregation |
| App type/seed/pure utility | 충족 | app/shared/data 모듈로 이동 |
| Supabase service | 충족 | agreements, management, procurement, press, projects, schedule service |
| lifecycle/autosave hook | 충족 | 인증·캐시·복원·도메인 autosave hook 분리 |
| App 탭 화면 | 충족 | 12개 feature screen 및 lazy boundary |
| `ScheduleManager` | 충족 | panel, modal, form field, parser/export/service 26개 feature 파일 |
| `ProcurementManager` | 충족 | 3개 도메인 panel, 5개 modal/popover, hook/service |
| `SatisfactionManager` | 부분 충족 | 타입·응답·통계 분석 경계 분리, 화면/AI/export 추가 분리 가능 |
| `PDCAManager` | 부분 충족 | 날짜·예산·권한·월간 일정 계산 경계 분리, 편집/PDF 추가 분리 가능 |
| `CommitteeManager` | 충족 | navigation, roster, meeting, report, 3개 modal 분리 |
| dependency direction | 충족 | feature가 shared/data를 사용하며 신규 역방향 import 없음 |
| API/DB/security contract | 충족 | endpoint, migration, table/RPC/payload 변경 없음 |
| lazy/bundle | 충족 | production build에서 500KB 초과 JS chunk 없음 |
| batch isolation | 충족 | 작은 책임 단위 커밋 및 매 batch 4개 gate |

## Size Evidence

| File | Before | After | Reduction |
|---|---:|---:|---:|
| `src/data/mockData.ts` | 18,812 | 6 | 99.97% |
| `src/App.tsx` | 14,462 | 4,670 | 67.71% |
| `src/components/ScheduleManager.tsx` | 9,419 | 3,943 | 58.14% |
| `src/components/ProcurementManager.tsx` | 7,520 | 3,236 | 56.97% |
| `src/components/CommitteeManager.tsx` | 4,417 | 2,894 | 34.48% |
| `src/components/PDCAManager.tsx` | 3,664 | 3,525 | 3.79% |
| `src/components/SatisfactionManager.tsx` | 3,403 | 3,347 | 1.65% |

현재 `src/features`에는 80개 파일, `src/data/mock-data`에는 14개 파일이 있다.
App 내부 직접 Supabase query와 `useEffect`는 기능 service/hook으로 이동했다.

## UI/UX Preservation

- 대형 JSX 추출마다 원본과 이동 본문을 문자 단위로 비교했다.
- wrapper DOM을 추가하지 않았고 기존 최상위 element를 그대로 유지했다.
- className, inline style, 표시 문자열과 조건 분기 본문을 변경하지 않았다.
- 위원회 화면을 로컬 브라우저에서 로그인 후 직접 탐색했다.
- 위원회 목록·위원 구성·회의 운영 및 의결 화면 렌더링을 확인했다.
- 정상 위원회 화면의 console error와 warning은 0건이었다.
- 외부위원 로그인은 `<form onSubmit>`과 PIN Enter `requestSubmit()` 경로를 정적 확인했다.

자동화된 동일 viewport 픽셀 diff suite는 아직 없다. 대신 이번 작업은 추출 JSX
문자 동등성, DOM 비증가 원칙, 브라우저 smoke test를 결합해 UI 변경 위험을 통제했다.

## Committee Critical Regression

- TypeScript compile: 0 errors
- lint: 0 diagnostics
- committee tests: 29/29 passed
- production build: passed
- 표결 입력 완전성, 일반/평가 안건 공식 값, 중복 안건 방지 검증
- 간사 제외 정족수, 최신 응답 기준 중복표결 제거 검증
- OTP/PAdES feature flag, provider guard, PDF hash/path/type 검증
- 사람용 위원회 코드와 단축 경로 가역 변환 검증

로컬 외부위원 링크의 실제 Edge Function 호출은 로컬 서버 미기동으로 실패했으나,
이는 배포 API가 필요한 환경 제약이며 화면 또는 인증 코드 회귀로 분류하지 않았다.

## Remaining Non-blocking Gaps

1. Playwright 기반 동일 viewport screenshot/DOM snapshot 자동화
2. `SatisfactionManager`의 AI 입력·설문 편집·결과·export 화면 추가 분리
3. `PDCAManager`의 P/D/C/A 편집 패널과 PDF/Markdown builder 추가 분리

위 항목은 현재 기능·UI·보안 계약의 완료를 막지 않으며 후속 구조 개선 batch로
독립 수행할 수 있다.

## Conclusion

목표 일치율 90%를 초과한 92%다. 핵심 구조 개편과 위원회 안정성 검증은 완료됐고,
남은 항목은 추가 세분화 및 시각 회귀 자동화에 해당한다.
