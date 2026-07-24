# asset-manager-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`AssetManager.tsx`의 공간 예약, 기자재, 활용 실적 화면과 모달이 한 파일에
집중된 구조를 UI와 런타임 동작을 보존하면서 안전한 표현 경계부터 분리한다.

## 2. Current State

- Parent: 2,789 lines
- 직접 Supabase I/O, Excel import/export, 예약 달력, 기자재 표와 4개 모달 포함
- 화면 JSX가 약 1,730줄이며 state와 event handler가 동일 파일에 결합
- 기존 `features/assets/screens/asset-screen.tsx`는 lazy wrapper만 제공

## 3. Goals

- [ ] 공용 asset type, constant, 순수 계산 함수를 feature 경계로 이동
- [ ] 자산 대분류 navigation을 typed component로 분리
- [ ] 공간 예약 신청 및 일시 조정 모달을 typed component로 분리
- [ ] 기자재 편집 및 활용 실적 모달을 typed component로 분리
- [ ] 부모가 Supabase I/O, state와 사용자 action handler를 계속 소유

## 4. Non-Goals

- DOM, class, inline style, text 또는 화면 레이아웃 변경
- Supabase schema/query/payload 변경
- 공간별 승인권자와 GUEST 권한 정책 변경
- Excel import/export 동작 변경
- 기자재 본문 표와 예약 달력의 재설계

## 5. Success Criteria

- [ ] 최소 4개 안전 경계 완료
- [ ] 이동 JSX normalized character exact
- [ ] 새 child의 직접 Supabase 접근 0
- [ ] TypeScript, lint, committee, visual, build 통과
- [ ] 외부위원 로그인 및 Enter 제출 회귀 0
- [ ] 설계 일치율 90% 이상

## 6. Sequence

1. type, constant, pure utility
2. subtab navigation
3. reservation form modal
4. reservation time modal
5. equipment form modal
6. utilization modal
7. 추가 본문 분리는 결합도 재평가 후 후속 PDCA로 결정

## 7. Risks

| Risk | Mitigation |
|---|---|
| form submit 및 닫기 동작 회귀 | 기존 handler와 setter를 props로 그대로 전달 |
| modal stacking/style 회귀 | 조건부 렌더링과 최상위 overlay JSX를 그대로 이동 |
| 예약 승인 정책 회귀 | 권한 helper와 DB handler는 부모에 유지 |
| 기자재 데이터 연결 회귀 | form state와 구매 완료 목록을 동일 참조로 전달 |
