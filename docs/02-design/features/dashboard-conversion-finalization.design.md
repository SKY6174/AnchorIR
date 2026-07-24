# dashboard-conversion-finalization - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/dashboard-conversion-finalization.plan.md`

## 1. Architecture

```text
ScheduleManager
  └─ utils/press-analyzer.ts

SatisfactionManager
  ├─ services/satisfaction-ai-service.ts
  ├─ services/satisfaction-export-service.ts
  └─ utils/satisfaction-report-prompt.ts

PDCAManager
  ├─ services/pdca-export-service.ts
  └─ components/
      ├─ pdca-plan-stage.tsx
      └─ pdca-do-stage.tsx
```

부모 manager는 state, effect, Supabase mutation과 사용자 action orchestration을
소유한다. service는 외부 호출·파일 생성을, presentational component는 기존
JSX만 소유한다.

## 2. Press Analyzer Contract

```ts
interface AnalyzePressUrlInput {
  url: string;
  selectedYear: number;
  apiKey?: string;
  openaiApiKey?: string;
}

interface PressAnalysisResult {
  parsed: PressAnalysisData;
  usedModel: string;
}
```

- 함수 본문, endpoint, model, fallback과 메시지 변경 0
- import 경로는 확장자 없는 `../utils/press-analyzer`로 변경
- unknown JSON 응답은 기존 런타임 필드 접근을 보존하는 구조 타입으로 좁힌다.

## 3. Satisfaction Boundaries

### AI service

- GPT 초안 생성
- Gemini 교차 검토
- OpenAI consensus compiler
- 호출 순서, prompt와 JSON parsing을 그대로 유지
- state setter와 modal state는 import하지 않는다.

### Prompt utility

- AI 만족도 총평 prompt 문자열을 동일 입력으로 반환한다.
- 설문·통계 데이터만 인자로 받는 순수 함수다.

### Export service

- 기존 workbook, sheet, header, column width와 filename을 그대로 생성한다.
- parent handler는 동일 survey를 service에 전달한다.

## 4. PDCA Boundaries

### Export service

```text
exportPdcaProgramPdf(input)
exportPdcaProgramMarkdown(input)
```

- PDF HTML, html2pdf option, filename과 alert 문구 유지
- Markdown 본문, Blob, filename과 다운로드 순서 유지
- parent는 active program과 현재 form snapshot을 명시적 input으로 전달
- PDF loading state는 parent가 시작·종료를 소유한다.

### P/D stage components

- 부모의 `activePdcaStage`와 권한 조건은 그대로 유지
- 조건 내부의 기존 `<form>`을 component root로 그대로 이동
- 모든 value/setter는 typed props 또는 기존 callback으로 전달
- child는 Supabase, localStorage, PDF library를 import하지 않는다.
- P/D 내부 계산 함수는 본문과 동일하거나 parent callback으로 유지한다.

## 5. Type Rules

- 기존 `LegacyPdcaRecord`, Satisfaction 타입을 재사용한다.
- 새 boundary에 명시적 `any`를 추가하지 않는다.
- 외부 library의 기존 untyped global은 최소 local interface로 캡슐화한다.
- props setter는 `Dispatch<SetStateAction<T>>`를 사용한다.

## 6. UI Preservation

- 새 wrapper, Portal, Suspense 추가 0
- JSX 태그, 속성, className, style, text와 map 순서 변경 0
- 이동 JSX는 선행 들여쓰기와 prop 식별자 차이만 정규화해 비교
- handler 호출 시점·인자·setter 순서 변경 0

## 7. Implementation Order

1. press analyzer TypeScript 전환
2. Satisfaction AI service
3. Satisfaction prompt utility
4. Satisfaction export service
5. PDCA export service
6. PDCA P stage
7. PDCA D stage
8. 전체 gap analysis와 modularization 문서 갱신
9. 최종 gate 후 push

## 8. Gates

각 batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`
- source/JSX normalized comparison

최종:

- `src` `.js`/`.jsx` 0개
- child Supabase/localStorage 접근 0
- JS chunk 500KB warning 0
- tracked worktree clean
- `git push origin main` 성공
