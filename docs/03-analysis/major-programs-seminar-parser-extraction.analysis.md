# Gap Analysis: major-programs-seminar-parser-extraction

> Date: 2026-07-24 | Design: `docs/02-design/features/major-programs-seminar-parser-extraction.design.md`

---

## Match Rate: 100%

## Summary

세미나 마크다운 파서를 순수 typed utility로 분리했다. 기존 함수 본문 exact
비교가 통과했으며 부모 upload handler의 파일 분기, 상태와 form binding은
변경하지 않았다.

## Implemented Items

- [x] `parseSeminarMarkdown` utility 분리
- [x] 기존 `SeminarRecord` 반환 타입 유지
- [x] parent import와 단일 호출부 교체
- [x] parent 내부 parser 제거

## Preservation Evidence

- parser body exact comparison: pass
- 정규식, 실행 순서, 기본값, 계산과 반환 필드 변경 0
- FileReader, timeout, alert, loading/status와 setter 순서 변경 0
- JSX와 CSS 변경 0
- utility의 React/Supabase/localStorage 접근 0
- 외부위원 코드 변경 0

## Verification

| Gate | Result |
|---|---|
| TypeScript | pass |
| lint | pass, warning 0 |
| committee tests | 29/29 pass |
| visual tests | 3/3 pass |
| production build | pass |
| `git diff --check` | pass |

## Size Result

- `MajorProgramsManager.tsx`: 1,303 → 1,209 lines
- 이번 PDCA 감소: 94 lines, 7.2%
- 최초 분리 전 2,631줄 대비 누적 감소: 1,422 lines, 54.0%

## Missing Items

- 없음

## Changed Items

- 함수명만 역할을 명확히 표현하도록 `parseMarkdownContent`에서
  `parseSeminarMarkdown`으로 변경했다.

## Recommendation

설계 범위는 완료됐다. 다음 단계는 남은 parent의 DB fetch 또는 업로드
orchestration처럼 UI와 분리 가능한 책임을 다시 평가한다.
