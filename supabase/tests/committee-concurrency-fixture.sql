-- Production-safe synthetic fixture. The fixed TEST prefix scopes every row.
-- Run only during an approved check window, then run the matching cleanup script.

DO $$
DECLARE
  test_committee_id CONSTANT TEXT := 'TEST-CONCURRENCY-097';
  test_meeting_id CONSTANT UUID := '00000000-0000-4000-8000-000000000097';
  test_public_code CONSTANT TEXT := 'TEST-CONCURRENCY-097-B10C802';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'committee-signatures'
      AND name LIKE test_meeting_id::text || '/%'
  ) THEN
    RAISE EXCEPTION 'TEST_SIGNATURE_OBJECTS_REQUIRE_MANUAL_CLEANUP';
  END IF;

  DELETE FROM public.committee_vote_audit_log
  WHERE meeting_id = test_meeting_id;

  DELETE FROM public.committee_meetings
  WHERE id = test_meeting_id;

  DELETE FROM public.committees
  WHERE id = test_committee_id;

  INSERT INTO public.committees(id, name, total_quorum, voting_rule)
  VALUES (test_committee_id, '[TEST] 동시 제출 검증 위원회', 10, 'majority_of_attendees');

  INSERT INTO public.committee_members(
    committee_id, type, name, org, dept, rank, location, note,
    year, sort_order, role_code
  )
  SELECT
    test_committee_id,
    CASE WHEN voter_no = 1 THEN '위원장' ELSE '위원' END,
    'TEST-VOTER-' || lpad(voter_no::text, 2, '0'),
    'TEST-ONLY', 'Concurrency', 'Synthetic', '교외', test_committee_id,
    '2', voter_no,
    CASE WHEN voter_no = 1 THEN 'CHAIRMAN' ELSE 'MEMBER' END
  FROM generate_series(1, 10) AS voter_no;

  INSERT INTO public.committee_meetings(
    id, committee_id, title, meeting_date, meeting_type, agenda,
    status, access_pin, public_code, closes_at
  ) VALUES (
    test_meeting_id, test_committee_id, '[TEST] 10명 동시 제출 검증', now(),
    'ONLINE_WRITTEN', 'Synthetic concurrency and rollback verification only',
    'ACTIVE', NULL, test_public_code, now() + interval '2 hours'
  );

  INSERT INTO public.meeting_agendas(
    id, meeting_id, title, description, is_evaluation, sort_order
  ) VALUES
    ('00000000-0000-4000-8000-00000000a001', test_meeting_id,
     '[TEST] 일반 표결', 'APPROVE/REJECT concurrency verification', false, 1),
    ('00000000-0000-4000-8000-00000000a002', test_meeting_id,
     '[TEST] 평가 표결', 'Score concurrency verification', true, 2);

  INSERT INTO public.committee_meeting_members(meeting_id, member_id, role_code)
  SELECT test_meeting_id, id, role_code
  FROM public.committee_members
  WHERE committee_id = test_committee_id;

  INSERT INTO public.committee_vote_credentials(
    meeting_id, member_id, pin_hash, expires_at,
    failed_attempts, locked_until, revoked_at, updated_at
  )
  SELECT
    test_meeting_id, id, crypt('654321', gen_salt('bf', 12)), now() + interval '2 hours',
    0, NULL, NULL, now()
  FROM public.committee_members
  WHERE committee_id = test_committee_id;
END;
$$;

SELECT
  (SELECT count(*) FROM public.committee_members WHERE committee_id = 'TEST-CONCURRENCY-097') AS member_count,
  (SELECT count(*) FROM public.committee_meeting_members WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS roster_count,
  (SELECT count(*) FROM public.committee_vote_credentials WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS credential_count,
  (SELECT count(*) FROM public.meeting_agendas WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS agenda_count;
