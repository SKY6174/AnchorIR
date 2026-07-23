-- Verify the expected state after committee-concurrency-e2e.mjs.

DO $$
DECLARE
  test_meeting_id CONSTANT UUID := '00000000-0000-4000-8000-000000000097';
  official_result JSONB;
BEGIN
  IF (SELECT count(*) FROM public.committee_members
      WHERE committee_id = 'TEST-CONCURRENCY-097') <> 10 THEN
    RAISE EXCEPTION 'Expected 10 synthetic committee members';
  END IF;

  IF (SELECT count(*) FROM public.committee_meeting_members
      WHERE meeting_id = test_meeting_id) <> 10 THEN
    RAISE EXCEPTION 'Expected 10 roster members';
  END IF;

  IF (SELECT count(*) FROM public.committee_vote_sessions
      WHERE meeting_id = test_meeting_id) <> 10 THEN
    RAISE EXCEPTION 'Expected 10 voter sessions';
  END IF;

  IF (SELECT count(*) FROM public.meeting_responses
      WHERE meeting_id = test_meeting_id) <> 10 THEN
    RAISE EXCEPTION 'Expected 10 canonical responses';
  END IF;

  IF (SELECT sum(revision) FROM public.meeting_responses
      WHERE meeting_id = test_meeting_id) <> 11 THEN
    RAISE EXCEPTION 'Expected nine revision-1 responses and one revision-2 response';
  END IF;

  IF (SELECT count(*) FROM public.meeting_agenda_votes
      WHERE meeting_id = test_meeting_id) <> 20 THEN
    RAISE EXCEPTION 'Expected 20 agenda votes';
  END IF;

  IF (SELECT count(*)
      FROM public.committee_vote_submission_requests request
      JOIN public.committee_vote_sessions session ON session.id = request.session_id
      WHERE session.meeting_id = test_meeting_id) <> 11 THEN
    RAISE EXCEPTION 'Expected 11 accepted idempotency requests';
  END IF;

  IF (SELECT count(*) FROM public.committee_vote_audit_log
      WHERE meeting_id = test_meeting_id AND event_type = 'VOTER_AUTHENTICATED') <> 10 THEN
    RAISE EXCEPTION 'Expected 10 authentication audit records';
  END IF;

  IF (SELECT count(*) FROM public.committee_vote_audit_log
      WHERE meeting_id = test_meeting_id AND event_type = 'VOTE_SUBMITTED') <> 11 THEN
    RAISE EXCEPTION 'Expected 11 submission audit records';
  END IF;

  IF (SELECT count(*) FROM public.meeting_agenda_votes
      WHERE meeting_id = test_meeting_id
        AND agenda_id = '00000000-0000-4000-8000-00000000a001'
        AND vote = 'APPROVE') <> 9 THEN
    RAISE EXCEPTION 'Expected 9 approvals on the general agenda';
  END IF;

  IF (SELECT count(*) FROM public.meeting_agenda_votes
      WHERE meeting_id = test_meeting_id
        AND agenda_id = '00000000-0000-4000-8000-00000000a001'
        AND vote = 'REJECT') <> 1 THEN
    RAISE EXCEPTION 'Expected 1 rejection on the general agenda';
  END IF;

  IF (SELECT avg(score) FROM public.meeting_agenda_votes
      WHERE meeting_id = test_meeting_id
        AND agenda_id = '00000000-0000-4000-8000-00000000a002') <> 4.9 THEN
    RAISE EXCEPTION 'Expected evaluation average 4.9';
  END IF;

  SELECT public.get_committee_meeting_result(test_meeting_id) INTO official_result;
  IF (official_result->>'total')::integer <> 10
     OR (official_result->>'attended')::integer <> 10
     OR (official_result->>'required_attendance')::integer <> 6
     OR (official_result->>'required_approval')::integer <> 6
     OR official_result->>'decision_status' <> 'APPROVED' THEN
    RAISE EXCEPTION 'Official quorum result mismatch: %', official_result;
  END IF;

  IF (SELECT count(*) FROM storage.objects
      WHERE bucket_id = 'committee-signatures'
        AND name LIKE test_meeting_id::text || '/%') <> 11 THEN
    RAISE EXCEPTION 'Expected 11 persisted synthetic signature objects';
  END IF;
END;
$$;

SELECT
  (SELECT count(*) FROM public.meeting_responses
   WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS response_count,
  (SELECT count(*) FROM public.meeting_agenda_votes
   WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS agenda_vote_count,
  (SELECT sum(revision) FROM public.meeting_responses
   WHERE meeting_id = '00000000-0000-4000-8000-000000000097') AS revision_sum,
  public.get_committee_meeting_result('00000000-0000-4000-8000-000000000097') AS official_result;
