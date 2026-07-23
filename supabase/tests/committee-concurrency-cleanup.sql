-- Run after deleting the matching committee-signatures folder through Storage API/UI.

DO $$
DECLARE
  test_meeting_id CONSTANT UUID := '00000000-0000-4000-8000-000000000097';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'committee-signatures'
      AND name LIKE test_meeting_id::text || '/%'
  ) THEN
    RAISE EXCEPTION 'TEST_SIGNATURE_OBJECTS_STILL_EXIST';
  END IF;

  DELETE FROM public.committee_vote_audit_log
  WHERE meeting_id = test_meeting_id;

  DELETE FROM public.committee_meetings
  WHERE id = test_meeting_id;

  DELETE FROM public.committees
  WHERE id = 'TEST-CONCURRENCY-097';

  IF EXISTS (SELECT 1 FROM public.committees WHERE id = 'TEST-CONCURRENCY-097')
     OR EXISTS (SELECT 1 FROM public.committee_members WHERE committee_id = 'TEST-CONCURRENCY-097')
     OR EXISTS (SELECT 1 FROM public.committee_meetings WHERE id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.committee_meeting_members WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.committee_vote_credentials WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.committee_vote_sessions WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.meeting_agendas WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.meeting_responses WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.meeting_agenda_votes WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.meeting_results WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.committee_report_snapshots WHERE meeting_id = test_meeting_id)
     OR EXISTS (SELECT 1 FROM public.committee_vote_audit_log WHERE meeting_id = test_meeting_id) THEN
    RAISE EXCEPTION 'TEST_FIXTURE_CLEANUP_INCOMPLETE';
  END IF;
END;
$$;

SELECT 'TEST-CONCURRENCY-097 cleanup complete' AS result;
