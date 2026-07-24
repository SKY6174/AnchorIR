# major-programs-seminar-parser-extraction - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

`MajorProgramsManager.tsx`에 남은 세미나 마크다운 파서를 순수 typed utility로
분리해 UI와 상태를 건드리지 않고 책임과 테스트 가능성을 개선한다.

## 2. Current State

- Parent: 1,303 lines
- `parseMarkdownContent`: 약 95 lines
- parser는 React state, DOM, Supabase와 무관한 순수 계산
- 업로드 handler가 parser를 직접 호출해 form state에 같은 순서로 반영

## 3. Goals

- [ ] `parseSeminarMarkdown` 순수 utility 분리
- [ ] 반환 타입을 기존 `SeminarRecord`로 유지
- [ ] 정규식, 기본값, 예산과 만족도 계산을 바이트 수준으로 보존
- [ ] parent upload handler의 호출과 setter 순서를 유지

## 4. Non-Goals

- DOM, class, inline style, text와 레이아웃 변경
- 파일 업로드 분기, timeout, alert와 상태 전환 변경
- parser 규칙 개선 또는 입력 검증 정책 변경
- Supabase query/payload와 localStorage key 변경
- 외부위원 기능 변경

## 5. Success Criteria

- [ ] 기존 parser 본문 normalized exact comparison 통과
- [ ] utility의 React/Supabase/localStorage 직접 접근 0
- [ ] TypeScript, lint, committee 29/29, visual 3/3, build 통과
- [ ] 설계 일치율 90% 이상

## 6. Safe Sequence

1. 기존 parser를 utility로 그대로 복사
2. 함수명만 `parseSeminarMarkdown`으로 명확화
3. parent import와 단일 호출부 교체
4. 원본 parser 제거
5. 전체 품질 게이트 실행

## 7. Risks

| Risk | Mitigation |
|---|---|
| 정규식 또는 기본값 회귀 | 함수 본문을 그대로 이동하고 normalized 비교 |
| form binding 회귀 | upload handler와 setter 순서를 변경하지 않음 |
| 타입 순환 의존 | 기존 `major-program-types`만 type import |
| UI 회귀 | JSX 수정 금지 및 visual 회귀 실행 |
