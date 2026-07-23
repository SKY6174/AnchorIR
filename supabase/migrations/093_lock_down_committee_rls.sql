-- Remove permissive public policies and replace them with authenticated administrator policies.
CREATE OR REPLACE FUNCTION public.is_committee_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rise_users u
    WHERE u.uuid = auth.uid()
      AND u.approved = true
      AND u.role_key IN (
        'DIRECTOR', 'G_DIRECTOR', 'HQ_HEAD', 'TEAM_LEADER', 'MANAGER',
        'RESEARCHER', 'CENTER_ECC', 'CENTER_ICC', 'CENTER_RCC',
        'CENTER_NURI', 'CENTER_SPECIAL'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_committee_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_committee_admin() TO authenticated, service_role;

DO $$
DECLARE
  target_table TEXT;
  policy_row RECORD;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'committees', 'committee_members', 'committee_meetings', 'committee_meeting_members', 'meeting_agendas',
    'meeting_responses', 'meeting_agenda_votes', 'meeting_results',
    'committee_vote_credentials', 'committee_vote_sessions',
    'committee_vote_submission_requests', 'committee_vote_audit_log',
    'committee_report_snapshots', 'committee_vote_migration_issues'
  ]
  LOOP
    FOR policy_row IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_row.policyname, target_table);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
  END LOOP;
END $$;

CREATE POLICY committee_admin_all_committees
  ON public.committees FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());
CREATE POLICY committee_admin_all_members
  ON public.committee_members FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());
CREATE POLICY committee_admin_all_meetings
  ON public.committee_meetings FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());
CREATE POLICY committee_admin_all_meeting_members
  ON public.committee_meeting_members FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());
CREATE POLICY committee_admin_all_agendas
  ON public.meeting_agendas FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());
CREATE POLICY committee_admin_all_results
  ON public.meeting_results FOR ALL TO authenticated
  USING (public.is_committee_admin()) WITH CHECK (public.is_committee_admin());

CREATE POLICY committee_admin_read_responses
  ON public.meeting_responses FOR SELECT TO authenticated
  USING (public.is_committee_admin());
CREATE POLICY committee_admin_read_votes
  ON public.meeting_agenda_votes FOR SELECT TO authenticated
  USING (public.is_committee_admin());
CREATE POLICY committee_admin_read_audit
  ON public.committee_vote_audit_log FOR SELECT TO authenticated
  USING (public.is_committee_admin());
CREATE POLICY committee_admin_read_snapshots
  ON public.committee_report_snapshots FOR SELECT TO authenticated
  USING (public.is_committee_admin());
CREATE POLICY committee_admin_read_migration_issues
  ON public.committee_vote_migration_issues FOR SELECT TO authenticated
  USING (public.is_committee_admin());

REVOKE ALL ON TABLE
  public.committees, public.committee_members, public.committee_meetings, public.committee_meeting_members,
  public.meeting_agendas, public.meeting_responses, public.meeting_agenda_votes,
  public.meeting_results, public.committee_vote_credentials,
  public.committee_vote_sessions, public.committee_vote_submission_requests,
  public.committee_vote_audit_log, public.committee_report_snapshots,
  public.committee_vote_migration_issues
FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.committees, public.committee_members, public.committee_meetings, public.committee_meeting_members,
  public.meeting_agendas, public.meeting_results
TO authenticated;
GRANT SELECT ON TABLE
  public.meeting_responses, public.meeting_agenda_votes,
  public.committee_vote_audit_log, public.committee_report_snapshots,
  public.committee_vote_migration_issues
TO authenticated;

GRANT ALL ON TABLE
  public.committees, public.committee_members, public.committee_meetings, public.committee_meeting_members,
  public.meeting_agendas, public.meeting_responses, public.meeting_agenda_votes,
  public.meeting_results, public.committee_vote_credentials,
  public.committee_vote_sessions, public.committee_vote_submission_requests,
  public.committee_vote_audit_log, public.committee_report_snapshots,
  public.committee_vote_migration_issues
TO service_role;

GRANT USAGE, SELECT ON SEQUENCE
  public.committee_members_id_seq,
  public.committee_vote_audit_log_id_seq,
  public.committee_vote_migration_issues_id_seq
TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
