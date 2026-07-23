# Gap Analysis: dashboard-modularization

> Date: 2026-07-24 | Design: `docs/02-design/features/dashboard-modularization.design.md`

---

## Match Rate: 17%

## Summary

설계된 12개 구현 batch 가운데 정적 mock 데이터 분리와 App 타입·seed·순수 데이터 utility 분리까지 2개 batch를 완료했다. 기존 import 계약, 정적 데이터 직렬화, JSX 구간과 Supabase 계약은 보존되었으며 전체 품질 gate를 통과했다. 나머지 service, hook, 화면과 manager 분리는 Act 단계에서 순차 수행한다.

## Implemented Items

- [x] `mockData.ts` 호환 facade 유지
- [x] 프로젝트 A~E 정적 데이터 분리
- [x] 1차년도 프로그램 A~D 도메인 분리
- [x] 타입·사용자 역할·연차 unit metadata 분리
- [x] App 공통 타입과 Window 전역 타입 분리
- [x] App 초기 seed 데이터 분리
- [x] App 다년도 변환·병합·KPI normalization utility 분리
- [x] TypeScript, lint, 위원회 29개 테스트, production build 통과

## Missing Items

- [ ] App Supabase service 분리
- [ ] App 자동 저장·복원·인증 hook 분리
- [ ] App 탭별 JSX component 분리
- [ ] `ScheduleManager` 도메인 분리
- [ ] `ProcurementManager` 도메인 분리
- [ ] `SatisfactionManager`와 `PDCAManager` 분리
- [ ] 위원회 회귀시험 보강
- [ ] `CommitteeManager` 마지막 분리
- [ ] lazy boundary 및 bundle 재측정
- [ ] 전체 UI screenshot/DOM 동등성 검증

## Changed Items (Deviations from Design)

- [x] 없음. 데이터 top-level key 순서와 직렬화 결과가 기존과 일치한다.

## Evidence

- `mockData.ts`: 18,812줄 → 6줄
- `App.tsx`: 14,462줄 → 12,568줄
- mock 데이터 직렬화: 323,982 bytes exact match
- TypeScript: 0 errors
- lint: 0 diagnostics
- committee tests: 29/29 passed
- production build: passed, 500KB 초과 chunk 없음

## Recommendations

1. Supabase 호출을 도메인별 service로 옮기되 오류·fallback 처리는 기존 handler에 먼저 유지한다.
2. 이후 IndexedDB/localStorage와 자동 저장 effect를 hook으로 이동한다.
3. JSX와 manager 분리는 앞 단계가 안정화된 후 진행한다.
4. `CommitteeManager`는 강화된 회귀시험을 통과한 뒤 마지막으로 분리한다.

## Next Steps

- [ ] Act 단계에서 미구현 10개 batch를 순차 완료
- [ ] 각 batch 독립 검증·커밋
- [ ] 최종 gap analysis에서 90% 이상 확인
