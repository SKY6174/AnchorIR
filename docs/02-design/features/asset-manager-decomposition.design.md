# asset-manager-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/asset-manager-decomposition.plan.md`

## 1. Architecture

```text
AssetManager
  ├─ AssetSubtabNavigation
  ├─ existing reservation calendar and equipment panels
  ├─ AssetReservationModal
  ├─ AssetReservationTimeModal
  ├─ AssetEquipmentModal
  ├─ AssetUtilizationModal
  ├─ asset-types
  └─ asset-utils
```

부모는 state, 권한 판정, Supabase I/O, Excel 처리와 action handler를 소유한다.
child는 전달받은 값과 callback만으로 기존 JSX를 렌더링한다.

## 2. UI Preservation Contract

- 기존 조건부 렌더링 위치와 순서를 유지한다.
- child가 반환하는 최상위 태그는 기존 JSX 최상위 태그와 동일하게 한다.
- wrapper DOM, Portal, animation 또는 focus 정책을 추가하지 않는다.
- class, inline style, text, aria, event 연결을 문자 수준으로 보존한다.
- 이동 전후 JSX는 들여쓰기만 정규화해 동일성을 확인한다.

## 3. Component Boundaries

### AssetSubtabNavigation

- `activeSubTab`, `onChangeSubTab`만 전달한다.
- 기존 두 button과 container를 그대로 렌더링한다.

### AssetReservationModal

- `isOpen` 조건은 부모에 유지한다.
- form data, setter, loading, submit/close callback, 공간 목록을 전달한다.
- DB 또는 권한 helper를 직접 호출하지 않는다.

### AssetReservationTimeModal

- editing reservation 존재 조건은 부모에 유지한다.
- 일시 조정 form data, setter, loading, submit/close callback을 전달한다.

### AssetEquipmentModal

- 구매 완료 목록, editing id, form data/setter, loading과 callback을 전달한다.
- 조달 데이터 조회와 저장은 부모에 유지한다.

### AssetUtilizationModal

- 선택 기자재, 실적 목록, form data/setter와 저장·삭제·닫기 callback을 전달한다.
- Supabase 접근 없이 UI만 렌더링한다.

## 4. Types and Utilities

- `LegacyAssetRecord`, `SpaceReservation`, `Equipment`를 `asset-types.ts`로 이동한다.
- `SPACES`, `SPACE_ROOMS`, `USAGE_TYPES`를 `asset-constants.ts`로 이동한다.
- `getErrorMessage`, `isTimeOverlapping`을 `asset-utils.ts`로 이동한다.
- 새 `any`는 추가하지 않으며 기존 legacy record 범위만 유지한다.

## 5. Data and Security

- `asset_reservations`, `equipment_assets`, 활용 실적 관련 query 변경 0
- insert/update/delete payload 변경 0
- 공간별 승인권자, 신청자 취소 및 GUEST 제한 변경 0
- Excel import/export 및 barcode 처리 변경 0

## 6. Extraction Sequence

1. type, constant, pure utility
2. subtab navigation
3. reservation modal
4. reservation time modal
5. equipment modal
6. utilization modal
7. 부모 조립과 미사용 import 정리

각 단계는 독립 커밋과 전체 gate 통과 후 다음 단계로 진행한다.

## 7. Test Gates

Every batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`

JSX 이동 batch는 normalized character exact 비교를 추가한다.

## 8. Completion Gate

- type/constant/utility와 4개 modal, navigation 분리
- parent line count 감소
- 새 child의 직접 Supabase 접근 0
- UI/API/권한/Excel 동작 변경 0
- committee 29/29, visual 3/3 및 전체 gate 통과
- 설계 일치율 90% 이상
