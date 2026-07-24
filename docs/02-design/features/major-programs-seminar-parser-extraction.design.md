# major-programs-seminar-parser-extraction - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/major-programs-seminar-parser-extraction.plan.md`

## 1. Architecture

```text
MajorProgramsManager.handleFileUpload
  └─ parseSeminarMarkdown(text, fileName)
       └─ SeminarRecord
```

utility는 입력 문자열만 읽고 기존 `SeminarRecord`를 반환한다. React state와
form binding은 부모 upload handler가 계속 소유한다.

## 2. Preservation Contract

- 기존 정규식, 실행 순서, 기본값과 반환 필드를 그대로 유지
- 파일명 NFC 정규화와 PDF/MD 분기는 부모에서 유지
- FileReader, timeout, alert, loading/status와 setter 순서 변경 금지
- JSX와 CSS 수정 금지

## 3. Utility Contract

```ts
parseSeminarMarkdown(text: string, fileName: string): SeminarRecord
```

- side effect 없음
- React, Supabase와 browser storage import 없음
- `major-program-types`의 `SeminarRecord`만 type import

## 4. Parent Ownership

- 파일 확장자 검증과 파일명 기반 fallback
- PDF/MD 분기와 FileReader
- 분석 상태와 안내 문구
- form field setter
- alert와 timeout

## 5. Files

```text
src/features/major-programs/utils/
└── seminar-markdown-parser.ts
```

수정 파일:

- `src/components/MajorProgramsManager.tsx`

## 6. Sequence

1. utility 파일에 parser 본문 이동
2. parent에서 utility import
3. 기존 호출을 `parseSeminarMarkdown`으로 변경
4. parent 내부 parser 삭제
5. normalized 비교와 전체 게이트

## 7. Gates

- TypeScript, lint, committee 29/29, visual 3/3, build
- `git diff --check`
- parser body normalized exact comparison
- utility의 React/Supabase/localStorage 접근 0
- design match rate 90% 이상
