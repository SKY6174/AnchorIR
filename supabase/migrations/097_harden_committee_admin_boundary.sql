-- Forward-only hardening after operational verification.
-- General researchers may submit their own rostered vote through the Edge Function,
-- but they must not administer committee records or finalize reports.

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
        'ADMIN', 'DIRECTOR', 'G_DIRECTOR', 'HQ_HEAD', 'TEAM_LEADER', 'MANAGER',
        'CENTER_ECC', 'CENTER_ICC', 'CENTER_RCC', 'CENTER_NURI', 'CENTER_SPECIAL'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_committee_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_committee_admin() TO authenticated, service_role;

COMMENT ON FUNCTION public.is_committee_admin() IS
  'Checks approved committee management roles; RESEARCHER is intentionally excluded.';

NOTIFY pgrst, 'reload schema';
