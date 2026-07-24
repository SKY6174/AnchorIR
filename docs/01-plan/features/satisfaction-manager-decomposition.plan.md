# satisfaction-manager-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`SatisfactionManager.tsx`의 설문 목록·결과·생성·상세·연동 modal 책임을 독립
컴포넌트로 분리해 변경 범위를 줄인다. 새로 구축한 Playwright baseline과 기존
네 가지 품질 gate를 사용해 UI와 기능을 보존한다.

## 2. Scope

### In Scope

- 결과 통계 tab
- 설문 목록 tab
- 신규 설문 생성 tab
- 설문 상세 tab
- Google Sheets viewer modal
- AI 결과 입력 modal

### Out of Scope

- DB schema, Supabase query, AI prompt와 export 알고리즘 변경
- className, inline style, 표시 문자열, JSX element 순서 변경
- 새 상태관리 library 또는 context 도입

## 3. Success Criteria

- [ ] 이동한 JSX 본문 문자 동등성 확인
- [ ] wrapper DOM 추가 0건
- [ ] 각 child가 명시적 typed props를 사용
- [ ] production 동작과 Supabase payload 변경 0건
- [ ] `SatisfactionManager.tsx`가 조립 책임 중심으로 축소
- [ ] TypeScript 0, lint 0, committee 29/29, visual 3/3, build 통과

## 4. Safe Order

1. 결과 tab
2. 목록 tab
3. 생성 tab
4. 상세 tab
5. Sheets modal
6. AI modal
7. 공통 props/state 경계 정리

각 단계는 독립 검증·커밋한다. JSX 이동 편의를 위한 새 `<div>`는 추가하지 않는다.

## 5. Risks

| Risk | Mitigation |
|---|---|
| handler 호출 인자 변경 | closure 값을 그대로 typed prop으로 전달 |
| conditional 분기 변경 | 부모 조건은 유지하고 내부 JSX만 이동 |
| chart/QR 렌더링 차이 | 기존 component/import와 props를 그대로 사용 |
| modal stacking 변화 | portal/wrapper를 새로 도입하지 않음 |
| 시각 회귀 | Playwright 0-pixel-diff baseline 실행 |

## 6. References

- `docs/02-design/features/dashboard-modularization.design.md`
- `docs/04-report/dashboard-visual-regression.report.md`
