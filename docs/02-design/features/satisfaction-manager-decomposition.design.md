# satisfaction-manager-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/satisfaction-manager-decomposition.plan.md`

## 1. Architecture

```text
SatisfactionManager
  ├─ SatisfactionResultsTab
  ├─ SatisfactionListTab
  ├─ SatisfactionCreateTab
  ├─ SatisfactionDetailTab
  ├─ SatisfactionSheetsModal
  └─ SatisfactionAiInputModal
```

부모는 DB I/O, state, effect, AI workflow와 handler를 유지한다. child는 전달받은
값과 callback으로 기존 JSX를 렌더링한다. context/store는 도입하지 않는다.

## 2. UI Preservation Contract

- 부모의 기존 조건식은 그대로 유지한다.
- 조건식 내부의 단일 최상위 JSX를 child return으로 문자 그대로 이동한다.
- child 호출은 기존 DOM을 대체하는 React 경계일 뿐 실제 element를 추가하지 않는다.
- className, inline style, 문자열, aria, label/input 관계와 key를 변경하지 않는다.
- callback은 기존 handler와 state setter를 그대로 전달한다.
- component memoization은 이번 범위에서 사용하지 않는다.

## 3. Component Boundaries

### Results Tab

Props: surveys, selectedYear, setSelectedSurveyId, setActiveSurveyTab,
handleDeleteSurvey. 통계 계산은 기존 순수 utility를 import한다.

### List Tab

Props: surveys, selectedYear, filterDepts/setFilterDepts, selectedSurveyId,
탐색·복사·삭제·동기화 handler와 상태.

### Create Tab

Props: 입력 state/value setters, question handler, submit handler,
tab navigation.

### Detail Tab

Props: selected survey, chart data, AI report/state, response form state,
QR/link/sync/export/close/generate handler.

### Modal Boundaries

Sheets modal은 selected survey와 close/export handler만 사용한다.
AI modal은 debate 단계와 extracted form state/handler를 명시적으로 전달한다.

## 4. Types

- 기존 `SatisfactionSurvey`, `SurveyResponse`, `AiSurveyData`, `DebateLog`를 재사용한다.
- `SatisfactionManagerProps` export 계약을 유지한다.
- child props는 setter에 `React.Dispatch<React.SetStateAction<T>>`를 사용한다.
- `any`를 새 props 경계에 도입하지 않는다.

## 5. API Contract

Supabase table, column, insert/update/delete payload는 변경하지 않는다. child는
Supabase client를 import하지 않으며 모든 I/O는 부모 handler를 호출한다.

## 6. Extraction Method

1. 이동 전 JSX 시작/끝 marker와 문자 수 기록
2. child 파일에 동일 JSX 붙여넣기
3. 필요한 식별자를 props/import로 해결
4. 부모에 child 호출 삽입
5. 이동 본문 문자 비교
6. TypeScript, lint, committee, visual, build
7. batch commit

## 7. Test Gates

Every batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`

Visual baseline은 dashboard와 external committee 로그인 화면이므로 Satisfaction
화면 전체를 직접 캡처하지는 않는다. 따라서 JSX 문자 비교가 이 feature의 직접
UI 동등성 gate이며, 공통 스타일·앱 초기 화면 회귀는 Playwright가 보조한다.

## 8. Completion Gate

- 계획한 6개 화면/modal 경계 중 최소 5개 완료
- parent line count 유의미한 감소
- production UI와 API contract 변경 0
- 전체 품질 gate 통과
- 설계 일치율 90% 이상
