# Gap Analysis: major-programs-manager-decomposition

> Date: 2026-07-24 | Design: `docs/02-design/features/major-programs-manager-decomposition.design.md`

---

## Match Rate: 100%

## Summary

설계의 5개 구현 경계와 모든 완료 조건을 충족했다. 정적 데이터와 타입, 순수
상태 판정 함수, 단위과제 내비게이션, 지산학 이음 세미나 모달을 분리했으며
부모는 Supabase, localStorage, Excel, PDF/MD parser와 action handler를 계속
소유한다.

## Implemented Items

- [x] 프로그램·주문식 교육과정·PM교수·학생·세미나 타입 분리
- [x] `ORDERLY_COURSES`, `PM_PROFESSORS`, `majorProgramsData` 1:1 이동
- [x] `getOverallStatus` pure utility 분리
- [x] `MajorProgramUnitNavigation` typed component 분리
- [x] `MajorProgramSeminarModal` typed component 분리
- [x] 부모 조립과 import 정리

## UI and Behavior Preservation

- 이동한 두 JSX 블록은 normalized exact comparison에서 차이 0
- 새 child가 반환하는 최상위 태그는 기존 최상위 `<div>`와 동일
- wrapper, Portal, class, inline style, text, aria, animation 변경 0
- Supabase query/payload, localStorage key, Excel, PDF/MD parser 변경 0
- 새 child의 Supabase/localStorage 직접 접근 0

## Verification

| Gate | Result |
|---|---|
| TypeScript | pass |
| lint | pass |
| committee tests | 29/29 pass |
| visual tests | 3/3 pass |
| production build | pass |
| `git diff --check` | pass |

## Size Result

- `MajorProgramsManager.tsx`: 2,631 → 1,904 lines
- 감소: 727 lines, 27.6%
- 분리된 feature files: types, data, utility, navigation, seminar modal

## Missing Items

- 없음

## Changed Items (Deviations from Design)

- 최초 모달 구현명이 `SeminarResultModal`이었으나 갭 분석 중 설계명
  `MajorProgramSeminarModal`로 정렬했다. 최종 편차는 없다.

## Recommendation

대형 주문식 교육과정 탭은 이번 설계의 non-goal이며, 상태·Excel·DB 결합도를
별도 분석한 후 독립 PDCA로 분리한다.

