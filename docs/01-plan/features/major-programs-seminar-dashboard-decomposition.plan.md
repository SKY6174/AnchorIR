# major-programs-seminar-dashboard-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`MajorProgramsManager.tsx`에 남은 지산학 이음 세미나 header, 성과 요약과
결과 대장 JSX를 UI와 데이터 동작을 보존하면서 typed child로 분리한다.

## 2. Current State

- Parent: 1,448 lines
- 세미나 dashboard branch: 약 280 lines
- 결과 등록 modal은 이미 별도 component로 분리됨
- 편집·삭제 action과 Supabase 삭제가 ledger JSX에 결합됨

## 3. Goals

- [ ] 세미나 header와 신규 등록 action 분리
- [ ] 성과 요약 카드 분리
- [ ] 결과 ledger table 분리
- [ ] Supabase 삭제와 form/modal state는 부모 callback으로 유지

## 4. Non-Goals

- DOM, class, inline style, text와 레이아웃 변경
- 세미나 데이터 값, 합계와 만족도 계산식 변경
- Supabase table/query/payload 변경
- PDF/MD parser와 AI 분석 workflow 변경
- 외부위원 기능 변경

## 5. Success Criteria

- [ ] 이동 JSX normalized exact comparison 통과
- [ ] child의 Supabase/localStorage 직접 접근 0
- [ ] 등록·수정·삭제 callback 호출 순서 유지
- [ ] TypeScript, lint, committee 29/29, visual 3/3, build 통과
- [ ] 설계 일치율 90% 이상

## 6. Safe Sequence

1. header
2. summary cards
3. parent delete handler 추출
4. ledger table
5. assembly/import cleanup

## 7. Risks

| Risk | Mitigation |
|---|---|
| 편집 form 초기화 회귀 | 기존 setter 호출을 동일 callback으로 유지 |
| 삭제 DB·UI 동기화 회귀 | 부모 handler에서 기존 query와 state 순서 보존 |
| 집계 값 변경 | 기존 reduce 계산식을 그대로 이동 |
| UI 회귀 | 기존 최상위 태그를 반환하고 wrapper 추가 금지 |

