-- Run after migration 100. This script performs catalog checks only.
DO $$
BEGIN
  IF to_regclass('public.committee_report_signatures') IS NULL THEN
    RAISE EXCEPTION 'committee_report_signatures table is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'committee_report_signatures'
      AND c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'committee_report_signatures RLS is not enabled';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'committee_report_signatures'
      AND policyname = 'committee_admin_read_report_signatures'
      AND cmd = 'SELECT'
  ) THEN
    RAISE EXCEPTION 'committee signature admin read policy is missing';
  END IF;

  IF has_table_privilege('authenticated', 'public.committee_report_signatures', 'INSERT')
     OR has_table_privilege('authenticated', 'public.committee_report_signatures', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.committee_report_signatures', 'DELETE') THEN
    RAISE EXCEPTION 'authenticated role must not mutate committee signatures directly';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.committee_report_signatures', 'SELECT') THEN
    RAISE EXCEPTION 'authenticated role requires SELECT for the admin RLS policy';
  END IF;

  IF has_function_privilege(
    'authenticated',
    'public.create_committee_report_signature_request(uuid,uuid,text,text,text,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'signature request RPC must remain service-role only';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'committee-report-staging'
      AND public = false
      AND file_size_limit = 20971520
      AND allowed_mime_types = ARRAY['application/pdf']
  ) THEN
    RAISE EXCEPTION 'private staging bucket is missing or misconfigured';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'committee-signed-reports'
      AND public = false
      AND file_size_limit = 20971520
      AND allowed_mime_types = ARRAY['application/pdf']
  ) THEN
    RAISE EXCEPTION 'private signed reports bucket is missing or misconfigured';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'committee_admin_upload_report_staging'
      AND cmd = 'INSERT'
  ) THEN
    RAISE EXCEPTION 'admin-only staging upload policy is missing';
  END IF;
END
$$;

SELECT
  'committee signing catalog verification passed' AS result,
  count(*) AS signature_rows
FROM public.committee_report_signatures;
