# Gap Analysis: pdca-manager-decomposition

> Date: 2026-07-24 | Design: `docs/02-design/features/pdca-manager-decomposition.design.md`

## Match Rate: 92%

## Summary

설계한 저위험 렌더링 경계와 완료 기준을 충족했다. 부모는 Supabase, PDF,
state/effect, 승인·저장 handler와 자동 단계 전환을 계속 소유하며, 여섯 child는
typed props만으로 기존 JSX를 렌더링한다. P/D 화면은 예산·KPI·월별 일정 상태가
강하게 결합되어 있어 설계 6단계의 재평가 결과 후속 PDCA로 분리했다.

## Implemented Items

- [x] `PdcaFeedbackToast`
- [x] `PdcaViewHeader`
- [x] `PdcaAllProgramsView`
- [x] `PdcaUnitExplorer`
- [x] `PdcaCheckStage`
- [x] `PdcaActStage`
- [x] 부모의 Supabase/PDF/localStorage/handler 소유권 유지
- [x] child 직접 Supabase 접근 0
- [x] 권한·GUEST read-only 조건 보존
- [x] API와 PDF 출력 contract 변경 0
- [x] batch별 TypeScript·lint·committee·visual·build 검증

## UI Preservation Evidence

| Boundary | Normalized JSX chars | Result |
|---|---:|---|
| Feedback toast | 1,164 | exact |
| View header | 1,171 | exact |
| All programs view | 7,316 | exact |
| Unit explorer | 2,155 | exact |
| Check stage | 1,930 | exact |
| Act stage | 4,036 | exact |

모든 본문은 들여쓰기만 정규화한 비교에서 원본과 일치했다. 새 DOM wrapper,
className, inline style, 문자열과 event handler 변경은 없다.

## Structural Result

- 기준 `PDCAManager.tsx`: 3,525 lines
- 변경 후: 3,209 lines
- 감소: 316 lines (9.0%)
- 새 typed feature components: 6

## Verification

- TypeScript: pass
- Lint: 0 warnings/errors
- Committee regression: 29/29 pass
- Visual/interaction regression: 3/3 pass
- Production build: pass
- `git diff --check`: pass

## Deferred Items

- `PdcaProgramWorkspace` 조립 경계
- `PdcaPlanStage`
- `PdcaDoStage`

P/D는 각각 다수의 budget category, KPI, 월별 일정, 자동 산식과 상태 setter를
공유한다. 단순 props 이동 시 경계가 지나치게 넓어지므로 타입·상태 모델을 먼저
설계하는 별도 후속 작업이 더 안전하다.

## Recommendations

1. P/D 분리는 공통 입력 모델 타입을 먼저 정의한 별도 PDCA에서 수행한다.
2. PDCA 화면 인증 fixture가 준비되면 단계별 visual baseline을 추가한다.
3. 현재 부모의 DB/PDF workflow는 UI 분리와 독립된 후속 service/hook 작업으로 둔다.

## Next Steps

- [x] Match rate 90% 이상
- [x] 완료 보고서 작성
- [ ] 다음 대형 manager의 저위험 화면 경계 분석
