# schedule-manager-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

이미 탭·모달이 feature 컴포넌트로 분리된 `ScheduleManager.tsx`에서 남아 있는
달력 렌더링과 대형 AI workflow 책임을 안전한 경계부터 추가 분리한다.
일정·회의·위원회·언론보도 기능과 화면은 완전히 보존한다.

## 2. Current State

- Parent: 3,943 lines
- 기존 panel/modal child: 13 files
- Parent 잔여 책임: DB/member handler, AI debate, form submit, calendar rendering
- 외부위원 회의·위원회 데이터와 연결되므로 회귀 위험이 높음

## 3. Goals

- [ ] 월간 달력 grid 렌더링을 typed component로 분리
- [ ] 날짜별 일정 index 계산을 hook/utility 경계로 정리
- [ ] 미사용 legacy press AI handler 제거 또는 격리
- [ ] AI workflow의 순수 helper를 service로 분리
- [ ] 부모가 DB I/O와 사용자 action handler를 계속 소유

## 4. Non-Goals

- UI redesign, DOM/class/style/text 변경
- Supabase schema/payload 변경
- 회의·위원회 권한 정책 변경
- AI prompt 또는 합의 결과 규칙 변경
- 기존 panel/modal의 추가 내부 재설계

## 5. Success Criteria

- [ ] 최소 3개 안전 경계 완료
- [ ] 이동 JSX normalized character exact
- [ ] child의 직접 Supabase 접근 0
- [ ] TypeScript, lint, committee, visual, build 통과
- [ ] 외부위원 로그인 및 Enter 제출 회귀 0
- [ ] 설계 일치율 90% 이상

## 6. Sequence

1. Calendar grid component
2. Calendar data/index utility 또는 hook
3. 미사용 legacy workflow 정리
4. 순수 AI form helper/service
5. 복잡한 stateful AI debate hook은 결합도 재평가 후 결정

## 7. Risks

| Risk | Mitigation |
|---|---|
| drag/drop 일정 이동 회귀 | 기존 callback과 JSX를 그대로 전달 |
| 선택 날짜 불일치 | 기존 날짜 계산식을 문자 그대로 유지 |
| 회의·위원회 흐름 회귀 | committee 29개와 visual 3개를 매 batch 실행 |
| AI 결과 변경 | prompt/state workflow는 초기 batch에서 이동하지 않음 |
