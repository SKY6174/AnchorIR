# dashboard-conversion-finalization - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

기존 dashboard modularization 결과의 명시적 잔여 항목을 모두 처리하고,
`src`의 JavaScript 잔존 파일을 TypeScript로 전환해 변환 계획을 최종 종료한다.

## 2. Baseline

- `dashboard-modularization` 설계 일치율: 92%
- 시각 회귀 자동화: 후속 PDCA에서 완료
- `SatisfactionManager.tsx`: 1,801줄, AI/API/export orchestration 잔존
- `PDCAManager.tsx`: 3,209줄, P/D 화면과 PDF/Markdown 생성 잔존
- `src` JavaScript 잔존: `utils/pressAnalyzer.js` 1개

## 3. Goals

### Batch A — JavaScript 종료

- [ ] `pressAnalyzer.js`를 typed `press-analyzer.ts`로 전환
- [ ] 동적 import와 반환 계약 유지
- [ ] `src`의 `.js`/`.jsx` production source 0개

### Batch B — Satisfaction 책임 분리

- [ ] OpenAI/Gemini/consensus 호출을 service로 분리
- [ ] AI 총평 prompt builder를 pure utility로 분리
- [ ] Excel export를 service로 분리
- [ ] 부모는 state와 사용자 action orchestration만 소유

### Batch C — PDCA 책임 분리

- [ ] PDF/Markdown 생성·다운로드를 export service로 분리
- [ ] P 단계 화면을 typed presentational component로 분리
- [ ] D 단계 화면을 typed presentational component로 분리
- [ ] 기존 C/A stage component와 함께 P/D/C/A 경계를 완성

### Batch D — 최종 검증 및 반영

- [ ] dashboard modularization gap을 다시 계산
- [ ] 전체 품질 gate 통과
- [ ] 관련 문서와 독립 커밋 완료
- [ ] 원격 `origin`에 현재 브랜치 push

## 4. Preservation Contract

- JSX element, className, inline style, text와 조건 순서 변경 0
- 새 DOM wrapper 추가 0
- Supabase table/query/payload 변경 0
- AI endpoint, model, prompt 내용과 fallback 순서 변경 0
- PDF/Markdown/Excel 내용·파일명·다운로드 동작 변경 0
- 외부위원 인증·심의·의결 production code 변경 0

## 5. Success Criteria

- [ ] TypeScript 오류 0
- [ ] lint 진단 0
- [ ] committee 29/29
- [ ] visual 3/3
- [ ] production build 성공 및 500KB warning 0
- [ ] `git diff --check` 통과
- [ ] 각 이동 본문 normalized exact comparison
- [ ] dashboard modularization 최종 일치율 100%
- [ ] `git push` 성공

## 6. Risks

| Risk | Mitigation |
|---|---|
| AI 응답 파싱 차이 | 함수 본문 1:1 이동과 typed boundary만 추가 |
| PDF 레이아웃 변화 | 기존 HTML/옵션/문자열을 그대로 service로 이동 |
| P/D form setter 연결 누락 | 기존 handler와 setter를 명시적 callback prop으로 전달 |
| UI 픽셀 변화 | wrapper 금지, JSX normalized exact 비교, visual gate |
| push 전 불완전 커밋 | clean tracked worktree와 전체 gate 재실행 |
