# Gap Analysis: dashboard-modularization

> Date: 2026-07-24 | Design: `docs/02-design/features/dashboard-modularization.design.md`

---

## Match Rate: 55%

## Summary

설계된 12개 구현 batch 가운데 정적 데이터, App 타입·seed·주요 utility, Supabase service, lazy/bundle 검증을 완료했다. App lifecycle은 캐시·인증·상태 영속화·전체 DB 로드·구성원 복원과 모든 도메인 자동저장 훅 분리를 완료했고, 다년도 프로젝트 정규화 엔진도 독립 모듈로 이동했다. JSX와 manager 분리는 아직 시작 전이므로 전체 일치율은 55%로 평가한다.

## Implemented Items

- [x] `mockData.ts` 호환 facade 유지
- [x] 프로젝트 A~E 정적 데이터 분리
- [x] 1차년도 프로그램 A~D 도메인 분리
- [x] 타입·사용자 역할·연차 unit metadata 분리
- [x] App 공통 타입과 Window 전역 타입 분리
- [x] App 초기 seed 데이터 분리
- [x] App 다년도 변환·병합·KPI normalization utility 분리
- [x] App Supabase query/mutation을 도메인 service로 분리
- [x] IndexedDB/localStorage 캐시와 정리 lifecycle 분리
- [x] Supabase Auth + 승인된 `rise_users` 세션 복원 hook 분리
- [x] 프로젝트·협약서·통합증명서·장학금 자동저장 hook 분리
- [x] 언론보도·환경개선·기자재·용역 자동저장 hook 분리
- [x] 월간·행사·회의 일정 자동저장과 cleanup flush hook 분리
- [x] 전체 DB 로드와 구성원 DB 복원 hook 분리
- [x] 프로젝트 다년도 정규화 순수 엔진 본체 분리
- [x] 스크롤·다크모드·메뉴 접근·탭/연차 상태 영속화 hook 분리
- [x] KPI 선택·프로젝트 fetch reset·정규화 lifecycle 분리
- [x] lazy boundary 유지 및 production bundle 재측정
- [x] TypeScript, lint, 위원회 29개 테스트, production build 통과

## Missing Items

- [ ] App 탭별 JSX component 분리
- [ ] `ScheduleManager` 도메인 분리
- [ ] `ProcurementManager` 도메인 분리
- [ ] `SatisfactionManager`와 `PDCAManager` 분리
- [ ] 위원회 회귀시험 보강
- [ ] `CommitteeManager` 마지막 분리
- [ ] 전체 UI screenshot/DOM 동등성 검증

## Changed Items (Deviations from Design)

- [x] 없음. 데이터 top-level key 순서와 직렬화 결과가 기존과 일치한다.

## Evidence

- `mockData.ts`: 18,812줄 → 6줄
- `App.tsx`: 14,462줄 → 9,568줄
- App 내부 `useEffect`: 55개 → 0개
- App 내부 직접 Supabase `.from(...)`: 0개
- 도메인 service: agreements, management, procurement, press, projects, schedule
- lifecycle/autosave hook: 25개 파일
- mock 데이터 직렬화: 323,982 bytes exact match
- TypeScript: 0 errors
- lint: 0 diagnostics
- committee tests: 29/29 passed
- production build: passed, 500KB 초과 chunk 없음

## Recommendations

1. App 탭별 JSX를 DOM·className 변경 없이 1:1 이동한다.
2. 화면 분리 패턴이 안정되면 `ScheduleManager`부터 manager를 순차 분리한다.
3. `CommitteeManager`는 강화된 회귀시험을 통과한 뒤 마지막으로 분리한다.

## Next Steps

- [ ] Act 단계에서 남은 lifecycle·화면·manager batch를 순차 완료
- [ ] 각 batch 독립 검증·커밋
- [ ] 최종 gap analysis에서 90% 이상 확인
