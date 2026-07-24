# major-programs-manager-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`MajorProgramsManager.tsx`에 집중된 주문식 교육과정 데이터, 단위과제 navigation,
세미나 결과보고 모달을 UI와 데이터 동작을 보존하면서 feature 경계로 분리한다.

## 2. Current State

- Parent: 2,631 lines
- 정적 과정·PM교수·연차 데이터 약 420줄 포함
- Supabase 조회, localStorage 복원, Excel 처리, 세미나 분석과 대형 JSX가 결합
- 별도 `features/major-programs` 경계가 없음

## 3. Goals

- [ ] type과 정적 fallback 데이터를 별도 data/type 파일로 이동
- [ ] 단위과제 선택 navigation을 typed component로 분리
- [ ] 세미나 결과보고 modal을 typed component로 분리
- [ ] 순수 상태 계산 helper를 utility 경계로 이동
- [ ] 부모가 Supabase I/O, localStorage와 action handler를 계속 소유

## 4. Non-Goals

- DOM, class, inline style, text 또는 레이아웃 변경
- Supabase schema/query/payload 변경
- Excel import/export 형식 변경
- 세미나 PDF/MD parser, AI prompt 또는 분석 규칙 변경
- 주문식 교육과정 상태 전환 규칙 변경

## 5. Success Criteria

- [ ] 최소 3개 안전 경계 완료
- [ ] 이동 JSX normalized character exact
- [ ] 새 child의 직접 Supabase/localStorage 접근 0
- [ ] TypeScript, lint, committee, visual, build 통과
- [ ] 외부위원 로그인 및 Enter 제출 회귀 0
- [ ] 설계 일치율 90% 이상

## 6. Sequence

1. type과 정적 fallback data
2. 순수 상태 계산 utility
3. 단위과제 navigation
4. 세미나 결과보고 modal
5. 부모 조립과 import 정리
6. 대형 주문식 교육과정 탭은 결합도 재평가 후 후속 PDCA로 결정

## 7. Risks

| Risk | Mitigation |
|---|---|
| fallback 데이터 매핑 회귀 | export/import만 변경하고 객체 내용을 그대로 이동 |
| 선택 과제·프로그램 복원 회귀 | state와 localStorage effect는 부모에 유지 |
| 세미나 등록·수정 회귀 | handler와 setter를 동일 이름의 props로 전달 |
| AI 분석 결과 변경 | parser와 분석 handler는 이번 범위에서 이동하지 않음 |
