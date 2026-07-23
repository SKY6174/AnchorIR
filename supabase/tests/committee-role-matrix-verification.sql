-- Read-only role matrix verification for migrations 093 and 097.
-- Run in a privileged SQL session. All session changes are rolled back.

BEGIN;

DO $$
DECLARE
  user_row RECORD;
  actual_admin BOOLEAN;
  expected_admin BOOLEAN;
BEGIN
  IF has_function_privilege('anon', 'public.is_committee_admin()', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon can execute is_committee_admin()';
  END IF;

  IF NOT has_function_privilege('authenticated', 'public.is_committee_admin()', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated cannot execute is_committee_admin()';
  END IF;

  IF position('RESEARCHER' IN pg_get_functiondef('public.is_committee_admin()'::regprocedure)) > 0 THEN
    RAISE EXCEPTION 'is_committee_admin() still includes RESEARCHER';
  END IF;

  IF position('ADMIN' IN pg_get_functiondef('public.is_committee_admin()'::regprocedure)) = 0 THEN
    RAISE EXCEPTION 'is_committee_admin() does not include ADMIN';
  END IF;

  FOR user_row IN
    SELECT uuid, role_key, approved
    FROM public.rise_users
    WHERE uuid IS NOT NULL
    ORDER BY role_key, uuid
  LOOP
    expected_admin := user_row.approved AND user_row.role_key IN (
      'ADMIN', 'DIRECTOR', 'G_DIRECTOR', 'HQ_HEAD', 'TEAM_LEADER', 'MANAGER',
      'CENTER_ECC', 'CENTER_ICC', 'CENTER_RCC', 'CENTER_NURI', 'CENTER_SPECIAL'
    );

    PERFORM set_config('request.jwt.claim.sub', user_row.uuid::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config(
      'request.jwt.claims',
      json_build_object('sub', user_row.uuid, 'role', 'authenticated')::text,
      true
    );

    SELECT public.is_committee_admin() INTO actual_admin;

    IF actual_admin IS DISTINCT FROM expected_admin THEN
      RAISE EXCEPTION
        'Committee role mismatch for role %, approved %: expected %, got %',
        user_row.role_key, user_row.approved, expected_admin, actual_admin;
    END IF;
  END LOOP;
END;
$$;

DO $$
DECLARE
  target_table TEXT;
  admin_policy_count INTEGER;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'committees', 'committee_members', 'committee_meetings',
    'committee_meeting_members', 'meeting_agendas', 'meeting_results'
  ]
  LOOP
    SELECT count(*) INTO admin_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = target_table
      AND 'authenticated' = ANY(roles)
      AND cmd = 'ALL'
      AND coalesce(qual, '') LIKE '%is_committee_admin%'
      AND coalesce(with_check, '') LIKE '%is_committee_admin%';

    IF admin_policy_count <> 1 THEN
      RAISE EXCEPTION
        'Expected exactly one authenticated admin ALL policy on %, found %',
        target_table, admin_policy_count;
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'meeting_responses', 'meeting_agenda_votes', 'committee_vote_audit_log',
        'committee_report_snapshots', 'committee_vote_migration_issues'
      )
      AND 'authenticated' = ANY(roles)
      AND cmd <> 'SELECT'
  ) THEN
    RAISE EXCEPTION 'Authenticated write policy found on server-owned committee tables';
  END IF;
END;
$$;

WITH expected_roles(role_key, expected_admin) AS (
  VALUES
    ('ADMIN', true), ('DIRECTOR', true), ('G_DIRECTOR', true),
    ('HQ_HEAD', true), ('TEAM_LEADER', true), ('MANAGER', true),
    ('CENTER_ECC', true), ('CENTER_ICC', true), ('CENTER_RCC', true),
    ('CENTER_NURI', true), ('CENTER_SPECIAL', true),
    ('RESEARCHER', false)
), actual_roles AS (
  SELECT
    role_key,
    count(*) FILTER (WHERE approved AND uuid IS NOT NULL) AS active_linked_users
  FROM public.rise_users
  GROUP BY role_key
)
SELECT
  expected_roles.role_key,
  expected_roles.expected_admin,
  coalesce(actual_roles.active_linked_users, 0) AS active_linked_users,
  coalesce(actual_roles.active_linked_users, 0) > 0 AS runtime_covered
FROM expected_roles
LEFT JOIN actual_roles USING (role_key)
ORDER BY expected_roles.expected_admin DESC, expected_roles.role_key;

ROLLBACK;
