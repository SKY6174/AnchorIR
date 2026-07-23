# Gap Analysis: committee-vote-stabilization

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-vote-stabilization.design.md`

---

## Match Rate: 97%

## Summary

외부위원과 로그인 위원의 인증·제출 신뢰 경계, 정규화·원자적 저장, 공개 RLS 제거, 간사 제외 공식 정족수, private storage 첨부/서명, legacy 변환, 서버 보고서 스냅샷과 HMAC 봉인까지 구현·운영 반영되었다. Supabase Auth를 유일한 로그인 신원으로 하고 `rise_users.uuid = auth.uid()`를 업무 권한 근거로 삼도록 기존 터널·데모 자동가입·자체 비밀번호 검증도 제거했다. 091~097은 운영 DB에 적용되었고, 원격 anon probe에서 `rise_users`와 위원회 핵심 테이블·RPC가 모두 `401/42501`로 차단됨을 확인했다. `committee-vote` Edge Function과 HMAC/CORS 비밀값도 운영 배포되어 공개 오류·origin 차단·봉인 검증 라우트 smoke test를 통과했다. 운영 E2E에서 명단 조회가 fallback 명단의 자동 DELETE/INSERT를 유발하던 경로를 추가 발견해 제거했고, 일반 `RESEARCHER`를 관리 권한에서 제외했다. 후속 Vercel 배포와 게스트 재로그인, 신규 탭 위원 명단 조회, DB/Edge 관리자 차단까지 검증했으며 경고 로그는 0건이었다. 읽기 전용 운영 역할 매트릭스도 통과하여 실제 계정이 존재하는 관리자 역할 9종과 `RESEARCHER` 차단을 런타임에서 확인했고, 계정이 없는 `DIRECTOR`, `CENTER_NURI`는 함수·정책 구조로 검증했다. 대시보드 JSX 태그·className·스타일은 변경하지 않았고 프론트 빌드와 핵심 순수 함수 6개 시험은 통과했다. 운영 격리 fixture로 외부위원 10명의 11개 동시 요청을 검증하여 최초 저장 10건·동시 중복 replay 1건, 반복 replay 10건, 수정 revision 2, 키 충돌 거부, 잘못된 점수의 원자적 rollback을 확인했다. DB 공식 결과도 응답 10건·안건표 20건·revision 합계 11, 찬성 9/반대 1, 평가평균 4.9, `APPROVED`로 일치했고 테스트 DB와 서명 11개는 모두 삭제했다. 남은 항목은 미보유 역할 실계정 CRUD, 운영 HMAC 신규 PDF 최종 비교 및 장기 모니터링이다.

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
- [x] 조회 시 fallback 명단을 자동 삭제·삽입하던 비명시적 write 경로 제거
- [x] 097 운영 적용: `ADMIN` 포함, 일반 `RESEARCHER` 위원회 관리 권한 제외
- [x] 로그인 성공 시 이전 사용자 탭 상태를 상속하지 않고 대시보드로 초기화
- [x] Vercel `main` 운영 배포 및 신규 브라우저 위원 명단 조회 경고 0건 확인
- [x] 게스트 연구원 `is_committee_admin() = false`, Edge 보고서 확정 `403/FORBIDDEN` 확인
- [x] 읽기 전용 운영 역할 매트릭스 통과: 관리자 역할 9종 런타임 허용, `RESEARCHER` 거부, 서버 소유 테이블 write 정책 부재
- [x] 제공 PDF Poppler 비교: 이전 3쪽에서 최신 2쪽으로 수렴, A4·한글·표·서명·잘림·겹침 이상 없음
- [x] PDF의 잔여 `디지털 서명 검증 코드` 표현을 `서버 봉인 검증 코드`로 정정
- [x] 운영 격리 동시성 시험: 10명/11개 동시 요청, 중복·재시도·revision·충돌·rollback 및 공식 집계 정합성 통과
- [x] 운영 시험 데이터 완전 정리: 테스트 서명 11개와 위원회·회의·명부·인증·세션·응답·표결·감사 로그 잔존 없음
- [x] 관리자 운영 E2E에서 HMAC 보고서 스냅샷 생성 및 공개 검증 API `valid: true` 확인
- [x] Blob URL과 임시 다운로드 앵커를 30초 유지하도록 보강하여 브라우저 다운로드 경합 제거

## Missing Items

- [ ] 운영 DB point-in-time backup 및 row count/hash 기준선 확보
- [ ] 운영 계정이 없는 `DIRECTOR`, `CENTER_NURI` 및 관리자별 실제 CRUD 허용 범위 검증
- [ ] 변환된 legacy 응답과 attachment batch 이관 결과를 staging에서 검토
- [x] `committee-vote` Edge Function 운영 배포와 HMAC/CORS 비밀값 설정
- [x] 운영 Edge smoke test: 허용 origin `404/NOT_FOUND`, 비허용 origin `403/FORBIDDEN`, 잘못된 봉인 검증 `200/valid:false`
- [x] 10명 이상 동시 제출 반복, idempotency 재시도, 오류 주입 rollback 시험
- [ ] anon CRUD 거부 및 역할별 관리자 CRUD 허용 통합시험
- [ ] SQL 정족수 함수와 TypeScript 결과의 자동 parity test
- [ ] 유효한 외부위원·간사·관리자 계정을 사용한 전체 브라우저 E2E
- [x] 신규 인증·위원회 프론트 변경을 `anchor-ir` Vercel 프로덕션에 배포
- [ ] 운영 HMAC 코드로 새로 생성한 PDF에서 A4 2쪽 및 봉인 문구를 최종 재확인
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
- 운영 E2E에서 발견한 구형 명단 자동복원 경로는 제거했지만, 향후 공식 명단 seed/갱신은 별도 승인된 관리자 작업 또는 migration으로만 수행해야 한다.
- 최신 제공 PDF는 레이아웃 기준을 통과했지만 보안 전환 이전 생성본이라 `공동인증`, `CA`, `100% 보장` 문구가 남아 있다. 현재 코드는 이 문구를 사용하지 않으므로 운영 HMAC 스냅샷으로 PDF를 다시 생성해 최종 확인해야 한다.
- 운영 동시성 시험의 첫 정리 시 `committee_meeting_members.member_id`가 `ON DELETE RESTRICT`임을 확인했다. 트랜잭션 롤백으로 데이터 손실은 없었고, 정리 도구를 회의 선삭제 순서와 전체 종속 테이블 잔존 검증으로 보강했다.
- 운영 HMAC 스냅샷은 관리자 계정으로 생성되고 검증 API에서 `valid: true`였으나, Codex 인앱 브라우저가 프로그램 방식 Blob 다운로드 이벤트를 노출하지 않아 생성 PDF 파일을 로컬로 회수하지 못했다. 일반 Chrome에서 동일 관리자 계정으로 1회 다운로드한 파일의 Poppler 시각 검증이 남아 있다.

## Recommendations

1. 운영 데이터 백업 기준선과 migration issue summary를 보관한다.
2. 유효한 외부위원·간사·각 관리자 역할 계정으로 전체 E2E와 CRUD 권한 매트릭스를 검증한다.
3. 기준 PDF와 생성 PDF의 A4 2쪽 시각 비교 및 verification 화면 연결을 마친다.
4. 위 검증 후 전체 TypeScript·lint 정리를 별도 기능으로 시작한다.

## Next Steps

- [x] 핵심 운영 배포 및 1차 보안 E2E를 완료한다.
- [x] 갭 분석을 다시 실행하여 90% 이상인지 확인한다.
- [ ] 전체 역할·운영 HMAC 신규 PDF 시각 검증을 별도 Check 항목으로 완료한다.
- [ ] 남은 검증 완료 후 최종 Report 단계로 전환한다.
