# committee-human-code - Design Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/committee-human-code.plan.md`

## 1. Mapping

| committee_id | Code |
|---|---|
| `total` | `STEER` |
| `planning`, `planning_op` | `PLAN` |
| `budget` | `BUDGET` |
| `evaluation` | `EVAL` |
| `ecc`, `ecc_op` | `ECC` |
| `icc`, `icc_op` | `ICC` |
| `rcc`, `rcc_op` | `RCC` |
| `aidx_op` | `AIDX` |
| `neulbom_op` | `NURI` |
| `newind_op` | `SEVEN` |
| `advisory` | `ADVISORY` |

## 2. Extraction

1. 제목에서 `제 N 차`, `N차`, `제 N 회`, `N회`를 순서대로 찾는다.
2. `N차년도`는 회의 차수로 보지 않는다.
3. 1~999 범위만 허용하고 두 자리 이상은 원 숫자를 유지한다.
4. 회의일시의 선두 `YYYY`를 우선 사용하고, 없으면 제목의 `20xx년`, 마지막으로 현재 연도를 사용한다.
5. 알 수 없는 위원회는 `GENERAL`, 차수 누락은 `XX`로 표시한다.

## 3. Integration

`CommitteeExternalVote`는 `meeting`의 `committee_id`, `title`, `meeting_date`로 표시 코드를 계산한다. 인증 요청에는 기존 URL에서 복원한 `public_code`를 그대로 전달한다.

## 4. Tests

- 위원회 ID 매핑
- `제1차`, `1차`, `제 12 회` 추출
- `제2차년도` 제외
- 연도와 zero padding
- 미지정 fallback
- lint, 위원회 시험, production build
