-- Run after migrations 091-095 in staging. This script is read-only and fails fast.
BEGIN;

DO $$
DECLARE
  missing_tables TEXT[];
  public_policy_count INTEGER;
  rls_disabled_count INTEGER;
  weak_default TEXT;
BEGIN
  SELECT array_agg(required.name) INTO missing_tables
  FROM unnest(ARRAY[
    'committee_meeting_members', 'committee_vote_credentials', 'committee_vote_sessions',
    'committee_vote_submission_requests', 'committee_vote_audit_log',
    'committee_report_snapshots', 'committee_vote_migration_issues'
  ]) required(name)
  WHERE to_regclass('public.' || required.name) IS NULL;
  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Missing committee vote tables: %', missing_tables;
  END IF;

  SELECT count(*) INTO rls_disabled_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN (
      'committees', 'committee_members', 'committee_meetings', 'committee_meeting_members',
      'meeting_agendas', 'meeting_responses', 'meeting_agenda_votes', 'meeting_results',
      'committee_vote_credentials', 'committee_vote_sessions',
      'committee_vote_submission_requests', 'committee_vote_audit_log',
      'committee_report_snapshots', 'committee_vote_migration_issues'
    )
    AND c.relrowsecurity = false;
  IF rls_disabled_count > 0 THEN
    RAISE EXCEPTION '% committee tables have RLS disabled', rls_disabled_count;
  END IF;

  SELECT count(*) INTO public_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'committees', 'committee_members', 'committee_meetings', 'committee_meeting_members',
      'meeting_agendas', 'meeting_responses', 'meeting_agenda_votes', 'meeting_results'
    )
    AND ('public' = ANY(roles) OR 'anon' = ANY(roles));
  IF public_policy_count > 0 THEN
    RAISE EXCEPTION 'Found % public/anon committee policies', public_policy_count;
  END IF;

  SELECT column_default INTO weak_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'committee_meetings' AND column_name = 'access_pin';
  IF weak_default IS NOT NULL THEN
    RAISE EXCEPTION 'committee_meetings.access_pin still has a default: %', weak_default;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.committee_members
    WHERE role_code NOT IN ('CHAIRMAN', 'MEMBER', 'SECRETARY') OR role_code IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid committee member role_code found';
  END IF;

  IF EXISTS (
    SELECT public_code FROM public.committee_meetings
    GROUP BY public_code HAVING public_code IS NULL OR count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Missing or duplicate public meeting code found';
  END IF;

  IF has_function_privilege('anon', 'public.authenticate_committee_voter(text,text,text,text,timestamptz,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon can execute authenticate_committee_voter directly';
  END IF;
  IF has_function_privilege('authenticated', 'public.submit_committee_vote(text,uuid,text,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated can execute external submit RPC directly';
  END IF;
END $$;

SELECT issue_code, unresolved_count
FROM public.committee_vote_migration_summary
ORDER BY issue_code;

SELECT
  (SELECT count(*) FROM public.committee_meetings) AS meeting_count,
  (SELECT count(*) FROM public.meeting_responses) AS response_count,
  (SELECT count(*) FROM public.meeting_agenda_votes) AS agenda_vote_count,
  (SELECT count(*) FROM public.committee_meeting_members) AS roster_count,
  (SELECT count(*) FROM public.committee_vote_credentials) AS credential_count;

ROLLBACK;
