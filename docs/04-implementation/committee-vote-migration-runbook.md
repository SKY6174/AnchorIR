# 위원회 의결 안정화 운영 마이그레이션 Runbook

> 대상: `committee-vote-stabilization` 접근 A
> 예상 점검 시간: 사전 staging 검증 완료 기준 10~20분

## 1. 사전 조건

- 운영 DB의 point-in-time recovery 또는 즉시 복원 가능한 snapshot이 활성화되어 있어야 한다.
- `rise_users.uuid`가 실제 `auth.users.id`와 매핑된 관리자 계정을 최소 1개 확인한다.
- 신규 Edge Function 환경에 다음 값을 설정한다.
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `COMMITTEE_REPORT_HMAC_KEY`: 32바이트 이상의 무작위 비밀값
  - `COMMITTEE_ALLOWED_ORIGINS`: 운영 대시보드 origin의 쉼표 구분 목록
- 기존 회의 수, 응답 수, 안건별 표결 수와 위원 수를 기록한다.
- `rise_users.email` 중복, `uuid` 고아·이메일 불일치가 0건인지 아래 preflight를 먼저 확인한다. `uuid`가 없는 행은 로그인 비활성 대상으로 별도 목록화한다.

```sql
SELECT 'committee_meetings' AS table_name, count(*) FROM public.committee_meetings
UNION ALL SELECT 'meeting_responses', count(*) FROM public.meeting_responses
UNION ALL SELECT 'meeting_agenda_votes', count(*) FROM public.meeting_agenda_votes
UNION ALL SELECT 'committee_members', count(*) FROM public.committee_members;

SELECT lower(trim(email)) AS normalized_email, count(*)
FROM public.rise_users
WHERE nullif(trim(email), '') IS NOT NULL
GROUP BY lower(trim(email)) HAVING count(*) > 1;

SELECT u.id, u.uuid, u.email, a.email AS auth_email
FROM public.rise_users u
LEFT JOIN auth.users a ON a.id = u.uuid
WHERE (u.uuid IS NOT NULL AND a.id IS NULL)
   OR (a.id IS NOT NULL AND lower(trim(u.email)) <> lower(trim(a.email)))
   OR u.uuid IS NULL;
```

## 2. Staging 적용

아래 순서를 바꾸지 않는다.

1. `091_committee_vote_security_schema.sql`
2. `092_backfill_committee_vote_data.sql`
3. `093_lock_down_committee_rls.sql`
4. `094_committee_vote_functions.sql`
5. `095_committee_storage_policies.sql`
6. `096_link_supabase_auth_rise_users.sql`
7. `supabase/tests/auth-rise-users-verification.sql`
8. `supabase/tests/committee-vote-verification.sql`
9. `committee-vote` Edge Function 배포

운영 검증에서 구형 명단 자동복원 write 또는 과도한 연구원 관리 권한이 발견된 환경은 `097_harden_committee_admin_boundary.sql`을 추가 적용한다.
기존 확정 보고서와 정규화 원장이 불일치하는 운영 환경은 승인된 대상에 한해 `098_reconcile_published_committee_report.sql`을 적용한다. malformed 보고서 스냅샷을 감사 보존하면서 검증 대상에서 제외하려면 `099_invalidate_malformed_report_snapshots.sql`을 적용한다.

`committee-vote`는 공개 회의 조회·외부위원 세션·관리자 JWT를 함수 내부에서 경로별로 검증하므로 플랫폼의 일괄 JWT 검사를 사용하지 않는다. 배포 시 아래 옵션을 반드시 유지한다.

```bash
npx supabase functions deploy committee-vote \
  --project-ref <project-ref> \
  --no-verify-jwt
```

배포 직후 공개 `verify-report`의 정상/무효 스냅샷과 비허용 Origin을 각각 시험한다. 플랫폼에서 `UNAUTHORIZED_NO_AUTH_HEADER`가 반환되면 잘못 배포된 것이므로 write를 재개하지 않고 `--no-verify-jwt`로 다시 배포한다.

`committee_vote_migration_summary`에서 다음 항목을 사람이 검토한다.

- `MEMBER_AUTH_MAPPING_MISSING`
- `LEGACY_RESPONSE_MEMBER_UNMAPPED`
- `MEMBER_COMMITTEE_MISMATCH`
- `AGENDA_MEETING_MISMATCH`
- `DUPLICATE_MEMBER_RESPONSE`

미해결 항목은 자동 보정하지 않고 원본과 위원 명단을 대조해 `resolved_at`과 처리 근거를 기록한다.

## 3. Staging smoke test

1. 잘못된 이름/PIN, `123456`, `1234`로 입장이 거부되는지 확인한다.
2. 올바른 회의 code·이름·PIN으로만 컨텍스트가 반환되는지 확인한다.
3. 다른 회의의 안건·첨부자료 URL을 요청해도 노출되지 않는지 확인한다.
4. 안건 한 개 미선택, 일반 안건 score, 평가 안건 vote를 각각 거부하는지 확인한다.
5. 동일 idempotency key 재시도는 revision을 증가시키지 않는지 확인한다.
6. 서로 다른 10명 이상의 동시 제출에서 응답·표결 유실이 없는지 확인한다.
7. 간사 제출은 저장되지만 공식 total/attended/approve에 포함되지 않는지 확인한다.
8. 관리자 결과, `get_committee_meeting_result`, PDF 수치가 일치하는지 확인한다.
9. PDF를 이미지로 렌더링해 A4 2쪽, 한글, 표, 서명, 봉인 상자를 확인한다.

## 4. 운영 점검 시간 절차

1. 위원회 신규 회의 생성·표결 제출을 잠시 중지한다.
2. 운영 DB snapshot/PITR 시점을 기록한다.
3. 사전 row count를 다시 기록한다.
4. 091~096을 파일 번호 순서대로 적용한다. 096 적용 직후 기존 자체 비밀번호 해시는 폐기되므로 구형 대시보드를 다시 열지 않는다.
5. 검증 SQL을 실행한다.
6. Edge Function과 환경 비밀값을 배포한다. `committee-vote`에는 반드시 `--no-verify-jwt`를 사용한다.
7. 관리자 1명과 시험 외부위원 1명으로 회의 조회·인증·제출·보고서 생성을 확인한다.
8. 신규 대시보드를 배포하고 write를 재개한다.
9. 30분 동안 인증 실패율, submit 오류, audit log, 응답/표결 수를 관찰한다.

## 5. 중단 기준

다음 중 하나라도 발생하면 write 재개를 중단한다.

- 검증 SQL 예외
- 기존 정규 응답 또는 표결 row 감소
- 관리자 계정 전부 RLS 거부
- 외부위원 정상 인증 불가
- 원자적 제출 후 응답과 안건 표결 수 불일치
- 다른 회의 자료 노출
- PDF와 DB 공식 결과 불일치

## 6. 복구

- 093 적용 전 문제: 신규 기능 배포를 중단하고 원인을 수정한 forward migration을 준비한다. 096이 이미 커밋되었다면 `rise_users.pw`를 복구하지 말고 Supabase Auth 기반 배포만 forward-fix 한다.
- 093 이후 인증·RLS 문제: 공개 정책을 임시 재개하지 않는다. 신규 write를 중지하고 관리자/Auth 매핑 또는 Edge Function을 수정한다.
- 데이터 손상 또는 대량 누락: 기록한 PITR 시점/snapshot으로 복원한다.
- 신규 테이블만의 문제: 운영 원본 테이블을 삭제하지 말고 기능 flag를 이전 배포로 돌린 뒤 forward fix를 적용한다.
- 서명/첨부 storage 객체는 DB 행 검증 후에만 orphan 정리한다.

## 7. 완료 증빙

- 적용 migration 목록과 시각
- 사전/사후 row count
- migration issue 처리 내역
- RLS 검증 결과
- 동시 제출 시험 결과
- 외부위원/간사/관리자 E2E 캡처
- 기준 PDF와 생성 PDF 렌더링 비교
- snapshot ID, payload SHA-256, verification 결과
