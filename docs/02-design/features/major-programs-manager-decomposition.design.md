# major-programs-manager-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/major-programs-manager-decomposition.plan.md`

## 1. Architecture

```text
MajorProgramsManager
  ├─ MajorProgramUnitNavigation
  ├─ existing orderly-course dashboard
  ├─ existing seminar result ledger
  ├─ MajorProgramSeminarModal
  ├─ major-program-types
  ├─ major-program-data
  └─ major-program-utils
```

부모는 state, Supabase I/O, localStorage, Excel 처리, PDF/MD parser와 action
handler를 소유한다. child는 props로 전달받은 값과 callback만 사용한다.

## 2. UI Preservation Contract

- JSX의 최상위 태그, 조건부 렌더링 위치와 순서를 유지한다.
- wrapper DOM, Portal, animation 또는 focus 정책을 추가하지 않는다.
- class, inline style, text, aria와 event 연결을 보존한다.
- 이동 JSX는 선행 들여쓰기만 제거한 normalized 문자 비교를 통과한다.

## 3. Data Boundary

- `PmProfessor`, `OrderlyCourse`, `StudentRecord`, `SeminarRecord`와 프로그램
  데이터 type을 `major-program-types.ts`로 이동한다.
- `ORDERLY_COURSES`, `PM_PROFESSORS`, `majorProgramsData`를
  `major-program-data.ts`로 그대로 이동한다.
- fallback 객체의 순서, 값, 숫자와 문자열을 변경하지 않는다.
- parent의 초기 state가 동일 export를 참조하도록 한다.

## 4. Component Boundaries

### MajorProgramUnitNavigation

- year data, unit key, selected/hovered unit과 setter callback을 전달한다.
- 기존 가로형 단위과제 badge JSX를 동일하게 렌더링한다.
- localStorage 또는 program selection을 직접 수행하지 않는다.

### MajorProgramSeminarModal

- `isSeminarModalOpen` 조건은 부모에 유지한다.
- form value/setter, loading, file upload와 submit/close callback을 전달한다.
- Supabase, parser와 AI service를 직접 호출하지 않는다.

## 5. Utility Boundary

- `getOverallStatus`의 course status 판정을 pure function으로 이동한다.
- 입력과 반환 union type을 유지한다.
- seminar parser와 파일 분석 workflow는 부모에 유지한다.

## 6. API and Security

- Supabase table/query/payload 변경 0
- localStorage key와 복원 순서 변경 0
- Excel workbook column과 filename 변경 0
- PDF/MD parsing, AI status text와 seminar upsert 규칙 변경 0
- 외부위원·위원회 인증/권한 코드 변경 0

## 7. Extraction Sequence

1. type과 정적 fallback data
2. pure course status utility
3. unit navigation
4. seminar result modal
5. 부모 조립과 미사용 import 정리

각 단계는 독립 커밋과 전체 gate 통과 후 다음 단계로 진행한다.

## 8. Test Gates

Every batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`

JSX 이동 batch는 normalized character exact 비교를 추가한다.

## 9. Completion Gate

- type/data, utility, navigation과 seminar modal 분리
- parent line count 감소
- 새 child의 직접 Supabase/localStorage 접근 0
- UI/API/parser/Excel 동작 변경 0
- committee 29/29, visual 3/3 및 전체 gate 통과
- 설계 일치율 90% 이상
