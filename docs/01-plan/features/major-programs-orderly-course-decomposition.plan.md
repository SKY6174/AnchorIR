# major-programs-orderly-course-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`MajorProgramsManager.tsx`에 남아 있는 주문식 교육과정 3개 하위 탭의 대형
JSX를 UI와 상태 동작을 보존하면서 typed child component로 분리한다.

## 2. Current State

- Parent: 1,904 lines
- 주문식 교육과정 분기: 약 535 lines
- 운영 계획, 운영 과정, 운영 결과/이수현황 JSX가 한 조건문에 결합
- Supabase fetch와 Excel import/export handler는 부모에 위치

## 3. Goals

- [ ] 주문식 교육과정 하위 탭 내비게이션 분리
- [ ] 운영 계획 탭 분리
- [ ] 운영 과정 탭 분리
- [ ] 운영 결과/이수현황 탭 분리
- [ ] 상태, DB, localStorage, Excel handler는 부모에 유지

## 4. Non-Goals

- DOM, class, inline style, text, aria 또는 레이아웃 변경
- 주문식 교육과정 데이터 값이나 상태 전환 규칙 변경
- Supabase query/payload 변경
- Excel 열, 파일명, import/export 규칙 변경
- 세미나 또는 외부위원 기능 변경

## 5. Success Criteria

- [ ] 이동 JSX normalized exact comparison 통과
- [ ] 새 child의 Supabase/localStorage 직접 접근 0
- [ ] 부모의 기존 state와 handler를 callback props로 유지
- [ ] TypeScript, lint, committee 29/29, visual 3/3, build 통과
- [ ] 설계 일치율 90% 이상

## 6. Safe Sequence

1. 하위 탭 내비게이션
2. 운영 계획 탭
3. 운영 과정 탭
4. 운영 결과/이수현황 탭
5. 부모 조립과 import 정리

각 단계는 이동 문자열 비교, 전체 gate와 독립 커밋을 완료한 뒤 다음 단계로
진행한다.

## 7. Risks

| Risk | Mitigation |
|---|---|
| JSX 이동 중 스타일 회귀 | 기존 최상위 태그를 그대로 반환하고 새 wrapper 금지 |
| 학생 상태 편집 회귀 | setter와 handler를 동일 값/호출 순서로 props 전달 |
| Excel 동작 회귀 | 다운로드·업로드 handler는 부모 소유 유지 |
| DB 경계 확산 | child에서 Supabase/localStorage import 금지 |

