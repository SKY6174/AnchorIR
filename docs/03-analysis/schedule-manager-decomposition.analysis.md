# Gap Analysis: schedule-manager-decomposition

> Date: 2026-07-24 | Design: `docs/02-design/features/schedule-manager-decomposition.design.md`

---

## Match Rate: 95%

## Summary

설계에서 정한 안전 경계인 달력 렌더링 컴포넌트, 날짜별 일정 계산 유틸리티
2개, 미사용 legacy AI 블록 정리를 모두 완료했다. 상태 결합도가 큰 AI debate
workflow는 설계의 재평가 조건에 따라 부모에 유지했으며 런타임 기능, UI, DB,
권한 및 AI prompt는 변경하지 않았다.

## Implemented Items

- [x] `ScheduleCalendarGrid`를 wrapper DOM 없이 분리
- [x] 달력 JSX의 들여쓰기 제외 normalized 문자 3,778자 일치
- [x] `buildSchedulesByDate`를 side-effect 없는 utility로 분리
- [x] `getSchedulesForDay`를 side-effect 없는 utility로 분리
- [x] parent의 기존 useMemo 및 선택일 조립 구조 유지
- [x] identifier reference가 없는 `DUPLICATE_REMOVE` legacy 블록 제거
- [x] 새 파일의 직접 Supabase/localStorage/AI service 접근 0
- [x] TypeScript, lint, committee 29/29, visual 3/3, build 통과

## Missing Items

- 없음. 설계의 Completion Gate를 모두 충족했다.

## Changed Items (Deviations from Design)

- AI workflow 추가 분리는 결합도 재평가 결과 후속 PDCA로 보류했다. 이는 설계
  6.5의 명시된 분기이며 이번 완료 범위의 편차가 아니다.

## Metrics

| 항목 | 결과 |
|---|---:|
| Parent line count | 3,943 → 3,532 |
| Parent 감소 | 411줄 (10.4%) |
| 새 component | 1개 |
| 새 pure utility | 2개 |
| UI/API/권한/AI prompt 변경 | 0 |

## Recommendations

1. ScheduleManager의 stateful AI debate 분리는 별도 설계와 fixture를 준비한 뒤 진행한다.
2. 다음 대형 manager는 외부위원 핵심 경로를 피하고 낮은 결합도의 화면 경계부터 분리한다.

## Next Steps

- [x] 일치율 90% 이상이므로 완료 보고로 진행
