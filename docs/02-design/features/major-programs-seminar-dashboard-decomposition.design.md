# major-programs-seminar-dashboard-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/major-programs-seminar-dashboard-decomposition.plan.md`

## 1. Architecture

```text
MajorProgramsManager
  ├─ MajorProgramSeminarHeader
  ├─ MajorProgramSeminarSummary
  ├─ MajorProgramSeminarLedger
  └─ MajorProgramSeminarModal (existing)
```

부모는 form/modal state, Supabase 삭제, PDF/MD parser와 action handler를
소유한다. child는 표시 값과 callback만 사용한다.

## 2. UI Preservation Contract

- 기존 조건부 렌더링 순서와 최상위 태그 유지
- wrapper, Portal, class, inline style, text, aria 변경 금지
- 이동 JSX normalized exact comparison 필수
- hover style mutation과 setter 호출 순서 유지

## 3. Component Boundaries

### MajorProgramSeminarHeader

- 프로그램 설명과 신규 등록 callback을 전달한다.
- form 초기화와 modal open은 부모 callback이 수행한다.

### MajorProgramSeminarSummary

- `seminarList`를 읽기 전용으로 전달한다.
- 개최 수, 참석자, 예산과 만족도 계산식을 그대로 유지한다.

### MajorProgramSeminarLedger

- `seminarList`, edit callback과 delete callback을 전달한다.
- Supabase를 직접 import하지 않는다.
- 행·열·버튼·aria와 표시 형식을 그대로 유지한다.

## 4. Parent Ownership

- form/modal/edit state와 setter
- Supabase `seminar_reports` 삭제
- `seminarList` 갱신
- PDF/MD parser, AI 분석과 submit

## 5. API and Security

- Supabase query/payload 변경 0
- localStorage key 변경 0
- PDF/MD parser와 AI workflow 변경 0
- 외부위원 인증·심의·의결 변경 0
- child의 Supabase/localStorage 접근 0

## 6. Files

```text
src/features/major-programs/components/
├── major-program-seminar-header.tsx
├── major-program-seminar-summary.tsx
└── major-program-seminar-ledger.tsx
```

## 7. Sequence

1. header
2. summary
3. parent delete handler
4. ledger
5. assembly/import cleanup

## 8. Gates

- TypeScript, lint, committee 29/29, visual 3/3, build
- `git diff --check`
- moved JSX normalized exact comparison
- design match rate 90% 이상

