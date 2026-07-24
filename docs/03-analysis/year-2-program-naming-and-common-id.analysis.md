# Gap Analysis: year-2-program-naming-and-common-id

> Date: 2026-07-24 | Design: `docs/02-design/features/year-2-program-naming-and-common-id.design.md`

---

## Match Rate: 100%

## Summary

2차년도 프로그램 데이터 모듈을 `year-2-programs-*` 규칙으로 통일하고,
공통운영경비 계층을 `X → X0 → X0-*`로 정렬했다. 기존 DB와 로컬 캐시의
최상위 `E`는 병합 전 공통 migration 함수에서 `X`로 변환된다.

## Implemented Items

- [x] A~D 파일을 `year-2-programs-a.ts`~`year-2-programs-d.ts`로 변경
- [x] 공통 파일을 `year-2-programs-x.ts`로 변경
- [x] export 상수를 `YEAR_2_PROGRAMS_*`로 변경
- [x] `initialProjectsData`를 A, B, C, D, X 순서로 조립
- [x] 공통운영경비 프로젝트 ID `E → X`
- [x] 기존 `X0` 및 `X0-*` ID 유지
- [x] 기존 DB·캐시 `E → X` 호환 migration 추가
- [x] App과 KPI의 공통 프로젝트 조건을 `X`로 변경

## Preservation Evidence

- 5개 이동 파일 normalized exact comparison: pass
- 비-ID 데이터, 배열 순서, 예산과 담당자 변경 0
- 런타임 프로젝트 순서: `A → B → C → D → X`
- 공통 계층: `X → X0 → X0-*` 10개
- legacy migration 샘플: `E → X`, 하위 ID 변경 0
- JSX 태그, class, inline style와 표시 문구 변경 0
- 외부위원 코드 변경 0

## Verification

| Gate | Result |
|---|---|
| TypeScript | pass |
| lint | pass, warning 0 |
| committee tests | 29/29 pass |
| visual tests | 3/3 pass |
| production build | pass |
| `git diff --check` | pass |

## Missing Items

- 없음

## Changed Items

- 없음

## Recommendation

설계 범위는 완료됐다. 향후 3차년도 데이터가 추가되면 동일한
`year-3-programs-*` 규칙을 적용한다.
