# schedule-manager-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/schedule-manager-decomposition.plan.md`

## 1. Architecture

```text
ScheduleManager
  ├─ existing schedule panels/modals
  ├─ ScheduleCalendarGrid
  ├─ schedule-calendar-utils
  │   ├─ buildSchedulesByDate
  │   └─ getSchedulesForDay
  └─ existing DB and AI workflows
```

이번 단계는 이미 분리된 탭·모달을 다시 변경하지 않는다. 부모의 달력 계산과
JSX만 독립 경계로 이동하고, DB I/O·form state·AI debate handler는 유지한다.

## 2. UI Preservation Contract

- 달력 cell JSX를 class/style/text/event 순서까지 그대로 이동한다.
- `ScheduleCalendarGrid`는 wrapper DOM을 추가하지 않고 cell 배열을 반환한다.
- drag/drop, double click, keyboard activation callback을 그대로 전달한다.
- 날짜 문자열과 부서 필터 계산식을 변경하지 않는다.
- 기존 panel props 이름과 호출 순서를 유지한다.

## 3. Boundaries

### ScheduleCalendarGrid

Props:

- displayYear/currentMonth/selectedDay
- schedulesByDate/currentRole
- draggingId/dragOverDate와 setter
- setSelectedDay, openAddModal, handleScheduleDrop, handleEditSchedule

직접 Supabase, localStorage 또는 AI service를 사용하지 않는다.

### schedule-calendar-utils

`buildSchedulesByDate`는 monthlySchedules, selectedDeptFilter, selectedYear로 기존
날짜별 map을 생성한다. `getSchedulesForDay`는 기존 날짜 key 계산으로 선택일
목록을 반환한다. 두 함수 모두 side effect가 없다.

### Legacy workflow

호출 지점이 없는 legacy press AI handler는 별도 batch에서 제거 가능성을
검증한다. 삭제 전 identifier reference 0과 전체 gate를 확인한다.

## 4. Types

- 기존 `ScheduleItem` 재사용
- 날짜 map: `Record<string, ScheduleItem[]>`
- setter: `Dispatch<SetStateAction<T>>`
- 새 `any` 도입 금지

## 5. API and Security

- Supabase table/query/payload 변경 0
- 회의·위원회 권한 조건 변경 0
- AI prompt/engine/fallback 변경 0
- GUEST의 추가·수정 제한 유지

## 6. Extraction Sequence

1. `schedule-calendar-utils.ts`
2. `schedule-calendar-grid.tsx`
3. Parent useMemo/getSelectedDaySchedules 조립 축소
4. legacy handler reference 검증 및 정리
5. AI workflow의 추가 분리는 결합도 재평가 후 후속 PDCA로 결정

## 7. Test Gates

Every batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`

JSX 이동 batch는 들여쓰기 정규화 문자 비교를 추가한다.

## 8. Completion Gate

- calendar component와 두 pure utility 완료
- parent line count 감소
- UI/API/AI/권한 변경 0
- committee 29/29, visual 3/3 및 전체 gate 통과
- 설계 일치율 90% 이상
