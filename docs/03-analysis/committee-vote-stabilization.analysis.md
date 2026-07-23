# Gap Analysis: committee-vote-stabilization

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-vote-stabilization.design.md`

---

## Match Rate: 89%

## Summary

외부위원과 로그인 위원의 인증·제출 신뢰 경계, 정규화·원자적 저장, 공개 RLS 제거, 간사 제외 공식 정족수, private storage 첨부/서명, legacy 변환, 서버 보고서 스냅샷과 HMAC 봉인까지 로컬 구현되었다. Supabase Auth를 유일한 로그인 신원으로 하고 `rise_users.uuid = auth.uid()`를 업무 권한 근거로 삼도록 기존 터널·데모 자동가입·자체 비밀번호 검증도 제거했다. 091~096은 운영 DB에 적용되었고, 원격 anon probe에서 `rise_users`와 위원회 핵심 테이블·RPC가 모두 `401/42501`로 차단됨을 확인했다. `committee-vote` Edge Function과 HMAC/CORS 비밀값도 운영 배포되어 공개 오류·origin 차단·봉인 검증 라우트 smoke test를 통과했다. 대시보드 JSX 태그·className·스타일은 변경하지 않았고 프론트 빌드와 핵심 순수 함수 6개 시험은 통과했다. 다만 신규 프론트의 Vercel 운영 배포, 인증 사용자 역할별 통합시험, 10명 이상 동시 제출, 브라우저 E2E 및 PDF 2쪽 시각 비교가 남아 있다.

## Implemented Items

- [x] 외부위원 화면의 `123456`/`1234` 우회, PIN 노출, 임시위원, 예외 강제입장 제거
- [x] 예측 불가능한 `public_code`, PIN hash, 실패 잠금, 해시 세션 토큰 설계
- [x] 외부 브라우저의 핵심 테이블 직접 write 제거와 관리자 RLS
- [x] UUID 기반 응답·안건 표결 원자적/멱등 RPC와 감사 로그
- [x] 미선택 안건 및 잘못된 vote/score의 클라이언트·서버 이중 거부
- [x] 제출 실패 후 성공 화면 또는 로컬 공식 기록을 만드는 폴백 제거
- [x] 로그인 위원의 direct table write를 Auth–위원 매핑 기반 서버 제출로 전환
- [x] 회의별 roster snapshot과 간사 제외 정족수 DB 함수
- [x] 관리자 정족수 전광판을 공식 DB 함수 결과에 연결
- [x] 관리자 응답·안건 통계를 정규 테이블 전용으로 전환하고 legacy/로컬 찬성 보정 제거
- [x] 다른 회의 localStorage를 임의 탐색하는 외부위원 첨부자료 폴백 제거
- [x] 서명 private storage 저장, SHA-256, 보상 삭제 처리
- [x] 신규 PDF 첨부자료 private storage 업로드와 기존 Base64 첨부자료 batch 이관 action
- [x] legacy `responses_data`의 비파괴 정규화와 미매핑 진단
- [x] PDF 입력을 DB 스냅샷으로 고정하고 미응답 자동 찬성 제거
- [x] 가짜 32-bit hash/CA/100% 보장 문구를 서버 HMAC 검증 정보로 교체
- [x] 결과 스냅샷 검증 endpoint 구현
- [x] JSX 태그·Tailwind/CSS class·대시보드 레이아웃 무변경
- [x] 핵심 검증/정족수 단위시험 6개 및 Vite production build 통과
- [x] Supabase Auth 세션 영속화·자동 갱신과 `rise_users.uuid` 승인 프로필 복원 연결
- [x] 타 계정 터널링, 하드코딩 자격증명, 데모 자동 가입, 클라이언트 역할 강제 보정 제거
- [x] 앱 캐시의 입력 비밀번호/access token/refresh token 저장 제거
- [x] 비밀번호 변경·중요 삭제 확인을 Supabase Auth 재인증으로 전환
- [x] `rise_users.pw` 폐기, Auth FK/이메일 가드, 자기조회·관리자 RLS용 096 migration 및 검증 SQL 준비
- [x] 운영 DB 091~096 적용 완료
- [x] 운영 anon 직접 조회 차단 확인: `rise_users`, 위원회 핵심 5개 테이블, `get_current_rise_user` RPC 모두 `401/42501`

## Missing Items

- [ ] 운영 DB point-in-time backup 및 row count/hash 기준선 확보
- [ ] 인증된 본인·관리자 역할별 `rise_users` 및 위원회 RLS 허용 범위 검증
- [ ] 변환된 legacy 응답과 attachment batch 이관 결과를 staging에서 검토
- [x] `committee-vote` Edge Function 운영 배포와 HMAC/CORS 비밀값 설정
- [x] 운영 Edge smoke test: 허용 origin `404/NOT_FOUND`, 비허용 origin `403/FORBIDDEN`, 잘못된 봉인 검증 `200/valid:false`
- [ ] 10명 이상 동시 제출 반복, idempotency 재시도, 오류 주입 rollback 시험
- [ ] anon CRUD 거부 및 역할별 관리자 CRUD 허용 통합시험
- [ ] SQL 정족수 함수와 TypeScript 결과의 자동 parity test
- [ ] 외부위원·간사·관리자 브라우저 E2E
- [ ] 신규 인증·위원회 프론트 변경을 `anchor-ir` Vercel 프로덕션에 배포
- [ ] 기준 PDF와 생성 PDF의 A4 2쪽 Poppler 렌더링 비교
- [ ] 수정 전후 주요 화면 스크린샷 픽셀 비교
- [ ] 보고서 verification URL 또는 화면 연결
- [ ] 운영 배포 후 모니터링과 forward rollback 실행 확인

## Changed Items (Deviations from Design)

- [x] 초기 설계의 위원별 서로 다른 PIN 대신 현재 UI를 보존하기 위해 회의별 PIN을 위원별 credential hash 행에 복제한다. 이름·회의 roster·opaque public code를 함께 검증하며 고정/약한 PIN은 거부한다.
- [x] 별도 `committee-report` 함수 대신 단일 `committee-vote` Edge Function의 action router에 report snapshot/verification을 포함했다.
- [x] PDF는 기존 클라이언트 렌더러를 보존하되 서버 스냅샷만 입력으로 사용한다.
- [x] 기존 DESIGN.md의 localStorage 복원 원칙은 일반 대시보드에 유지하지만 공식 표결·PDF 근거에서는 제거했다.

## Risks Found During Analysis

- `rise_users.uuid`가 없거나 이메일이 Supabase Auth와 다른 기존 행은 로그인할 수 없다. 096 preflight에서 중복·불일치·고아 UUID를 먼저 해소하고 `MISSING_AUTH_IDENTITY` 목록은 운영 승인 후 Auth 사용자를 발급해야 한다.
- 기존 `access_pin` 평문 열은 관리자 UI 호환을 위해 남아 있다. 외부 인증은 hash credential만 사용하지만 후속 단계에서 관리자 재발급 UX와 함께 평문 열을 폐기해야 한다.
- 운영 Supabase CLI 연결과 로컬 Postgres가 없어 이번 작업 환경에서는 신규 SQL을 실제 DB parser로 실행하지 못했다.

## Recommendations

1. 운영 반영 전에 staging clone에서 091~096을 적용하고 Auth/committee migration issue summary가 0이거나 승인된 예외인지 확인한다.
2. 첨부자료 storage 이관과 관리자 authenticated-member 제출 RPC를 먼저 완료한다.
3. 동시성/RLS/E2E/PDF 시각 시험을 통과한 뒤 짧은 점검 시간에 운영 write 경로를 전환한다.
4. 운영 전환 후에만 전체 TypeScript·lint 정리를 별도 기능으로 시작한다.

## Next Steps

- [ ] 남은 구현 갭을 보완한다.
- [ ] staging DB/API 통합검증을 수행한다.
- [ ] 갭 분석을 다시 실행하여 90% 이상인지 확인한다.
- [ ] 90% 이상과 운영 검증 완료 후 Check/Report 단계로 전환한다.
