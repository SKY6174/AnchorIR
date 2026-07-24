# Gap Analysis: asset-manager-decomposition

> Date: 2026-07-24 | Design: `docs/02-design/features/asset-manager-decomposition.design.md`

---

## Match Rate: 100%

## Summary

설계에서 정의한 type·constant·pure utility, navigation, 네 개 modal 경계를
모두 구현했다. 각 child는 전달받은 값과 callback만 사용하며 Supabase I/O,
권한 판정, Excel 처리와 state 소유권은 부모에 유지됐다.

## Implemented Items

- [x] `LegacyAssetRecord`, 공개 interface와 form type을 `asset-types.ts`로 이동
- [x] `SPACES`, `SPACE_ROOMS`, `USAGE_TYPES`를 `asset-constants.ts`로 이동
- [x] `getErrorMessage`, `isTimeOverlapping`을 pure utility로 이동
- [x] `AssetSubtabNavigation` 분리
- [x] `AssetReservationModal` 분리
- [x] `AssetReservationTimeModal` 분리
- [x] `AssetEquipmentModal` 분리
- [x] `AssetUtilizationModal` 분리
- [x] 부모 조립과 미사용 icon import 정리
- [x] 새 child의 직접 Supabase 접근 0
- [x] TypeScript, lint, committee 29/29, visual 3/3, build 통과

## Missing Items

- 없음.

## Changed Items (Deviations from Design)

- form state의 setter 계약을 명확히 하기 위해 `ReservationFormData`,
  `ReservationTimeFormData`, `EquipmentFormData`, `UtilizationFormData`를 추가했다.
  이는 설계의 typed component 원칙을 구체화한 것으로 동작 편차는 없다.

## UI Preservation Evidence

| 이동 경계 | 정규화 비교 |
|---|---|
| Subtab navigation | Exact |
| Reservation modal | Exact |
| Reservation time modal | Exact |
| Equipment modal | Exact |
| Utilization modal | Exact |

모든 비교는 원본과 신규 component의 JSX에서 선행 들여쓰기만 제거해 수행했다.

## Metrics

| 항목 | 결과 |
|---|---:|
| Parent line count | 2,789 → 2,149 |
| Parent 감소 | 640줄 (22.9%) |
| 새 UI component | 5개 |
| 새 pure utility | 2개 |
| UI/API/권한/Excel 동작 변경 | 0 |

## Recommendations

1. 예약 달력과 기자재 본문 표는 별도 PDCA에서 독립 fixture를 확보한 뒤 분리한다.
2. 현재 child component는 DB 접근 없이 표현 경계를 유지한다.

## Next Steps

- [x] 일치율 90% 이상이므로 완료 보고로 진행
