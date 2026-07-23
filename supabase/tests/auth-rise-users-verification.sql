-- Run after 096_link_supabase_auth_rise_users.sql in a privileged SQL session.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.rise_users WHERE pw IS NOT NULL) THEN
    RAISE EXCEPTION 'rise_users.pw still contains legacy password hashes';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.rise_users u
    LEFT JOIN auth.users a ON a.id = u.uuid
    WHERE u.uuid IS NOT NULL AND a.id IS NULL
  ) THEN
    RAISE EXCEPTION 'rise_users contains an orphan auth UUID';
  END IF;

  IF EXISTS (
    SELECT lower(email)
    FROM public.rise_users
    WHERE email IS NOT NULL
    GROUP BY lower(email)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'rise_users contains duplicate normalized emails';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'rise_users'
      AND policyname = 'rise_users_select_self'
  ) THEN
    RAISE EXCEPTION 'rise_users self-read policy is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rise_users_uuid_auth_users_fk'
      AND conrelid = 'public.rise_users'::regclass
  ) THEN
    RAISE EXCEPTION 'rise_users Auth foreign key is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'rise_users_auth_identity_guard'
      AND tgrelid = 'public.rise_users'::regclass
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'rise_users Auth identity guard trigger is missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'rise_users'
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles))
  ) THEN
    RAISE EXCEPTION 'rise_users still has an anonymous/public policy';
  END IF;
END;
$$;

SELECT issue_type, count(*) AS issue_count
FROM public.rise_user_auth_migration_issues
GROUP BY issue_type
ORDER BY issue_type;

SELECT
  count(*) FILTER (WHERE uuid IS NOT NULL) AS linked_users,
  count(*) FILTER (WHERE uuid IS NULL) AS login_disabled_users,
  count(*) FILTER (WHERE approved AND uuid IS NOT NULL) AS approved_login_users
FROM public.rise_users;
