# major-programs-orderly-course-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/major-programs-orderly-course-decomposition.plan.md`

## 1. Architecture

```text
MajorProgramsManager
  ├─ OrderlyCourseTabNavigation
  ├─ OrderlyCoursePlanTab
  ├─ OrderlyCourseProcessTab
  └─ OrderlyCourseResultTab
```

부모는 state, Supabase I/O, localStorage와 Excel handler를 소유한다. 각 child는
props와 callback만 사용하며 데이터를 저장하거나 외부 시스템에 접근하지 않는다.

## 2. UI Preservation Contract

- 기존 조건부 렌더링 순서와 최상위 태그를 유지한다.
- wrapper, Fragment로 인한 DOM 변화, Portal과 focus 정책을 추가하지 않는다.
- class, inline style, text, aria, form field id와 event 연결을 보존한다.
- 이동 JSX는 선행 들여쓰기만 제외한 normalized exact comparison을 통과한다.

## 3. Component Boundaries

### OrderlyCourseTabNavigation

- `orderlyTab`, `setOrderlyTab`만 전달한다.
- 기존 3개 탭 버튼과 스타일을 동일하게 렌더링한다.

### OrderlyCoursePlanTab

- `pmProfessors`를 읽기 전용으로 전달한다.
- 학과/전공별 운영 정보 테이블만 렌더링한다.

### OrderlyCourseProcessTab

- `orderlyCourses`, `activeCourseId`, setter를 전달한다.
- 학과 filter sidebar와 과정 운영 표를 동일하게 렌더링한다.

### OrderlyCourseResultTab

- 학생 목록, 학과 filter, 신규 학생 입력 state와 setter를 전달한다.
- Excel download/upload handler와 course status toggle callback을 전달한다.
- 통계 계산과 table-local badge style은 기존 JSX 위치에 유지한다.

## 4. Parent Ownership

- `orderlyTab`, `activeCourseId`, 학생/필터/입력 state
- Supabase 주문식 교육과정 fetch
- localStorage 복원·저장 effect
- Excel template download와 import
- 학생 상태 toggle

## 5. API and Security

- Supabase table/query/payload 변경 0
- localStorage key와 effect 순서 변경 0
- Excel workbook column, filename과 parsing 변경 0
- 세미나 및 외부위원 인증/심의/의결 변경 0
- child의 Supabase/localStorage import 0

## 6. File Structure

```text
src/features/major-programs/components/
├── orderly-course-tab-navigation.tsx
├── orderly-course-plan-tab.tsx
├── orderly-course-process-tab.tsx
└── orderly-course-result-tab.tsx
```

## 7. Extraction Sequence

1. tab navigation
2. plan tab
3. process tab
4. result tab
5. parent assembly/import cleanup

각 단계는 독립 커밋과 전체 gate 통과 후 다음 단계로 진행한다.

## 8. Test Gates

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`
- 이동 JSX normalized exact comparison

## 9. Completion Gate

- 4개 typed child component 분리
- parent line count 감소
- UI/API/Excel/state 동작 변경 0
- committee 29/29, visual 3/3 및 전체 gate 통과
- 설계 일치율 90% 이상

