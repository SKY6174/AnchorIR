-- Additive infrastructure for provider-backed PAdES signing.
-- Applying this migration does not enable signing and does not alter the existing HMAC report flow.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.committee_report_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES public.committee_report_snapshots(id) ON DELETE RESTRICT,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'signing', 'signed', 'failed', 'revoked')),
  provider TEXT NOT NULL,
  pades_profile TEXT NOT NULL DEFAULT 'B-T'
    CHECK (pades_profile IN ('B-T', 'B-LT', 'B-LTA')),
  unsigned_object_path TEXT NOT NULL,
  signed_object_path TEXT,
  unsigned_sha256 TEXT NOT NULL CHECK (unsigned_sha256 ~ '^[0-9a-f]{64}$'),
  signed_sha256 TEXT CHECK (signed_sha256 IS NULL OR signed_sha256 ~ '^[0-9a-f]{64}$'),
  certificate_subject TEXT,
  certificate_issuer TEXT,
  certificate_serial TEXT,
  certificate_fingerprint TEXT,
  signature_algorithm TEXT,
  signed_at TIMESTAMPTZ,
  tsa_subject TEXT,
  timestamp_at TIMESTAMPTZ,
  validation_result JSONB,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT committee_report_signatures_signed_fields_check CHECK (
    status <> 'signed'
    OR (
      signed_object_path IS NOT NULL
      AND signed_sha256 IS NOT NULL
      AND certificate_fingerprint IS NOT NULL
      AND signed_at IS NOT NULL
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS committee_report_signatures_idempotency_uidx
  ON public.committee_report_signatures(snapshot_id, unsigned_sha256, provider, pades_profile)
  WHERE status <> 'revoked';
CREATE INDEX IF NOT EXISTS committee_report_signatures_snapshot_idx
  ON public.committee_report_signatures(snapshot_id, created_at DESC);

ALTER TABLE public.committee_report_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS committee_admin_read_report_signatures
  ON public.committee_report_signatures;
CREATE POLICY committee_admin_read_report_signatures
  ON public.committee_report_signatures
  FOR SELECT
  TO authenticated
  USING (public.is_committee_admin());

REVOKE ALL ON TABLE public.committee_report_signatures FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.committee_report_signatures TO authenticated;
GRANT ALL ON TABLE public.committee_report_signatures TO service_role;

CREATE OR REPLACE FUNCTION public.guard_committee_report_signature_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  IF OLD.status IN ('signed', 'revoked') AND NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION 'IMMUTABLE_SIGNATURE';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS committee_report_signatures_guard_update
  ON public.committee_report_signatures;
CREATE TRIGGER committee_report_signatures_guard_update
  BEFORE UPDATE ON public.committee_report_signatures
  FOR EACH ROW EXECUTE FUNCTION public.guard_committee_report_signature_update();

REVOKE ALL ON FUNCTION public.guard_committee_report_signature_update()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_committee_report_signature_update()
  TO service_role;

CREATE OR REPLACE FUNCTION public.create_committee_report_signature_request(
  p_snapshot_id UUID,
  p_requested_by UUID,
  p_provider TEXT,
  p_pades_profile TEXT,
  p_unsigned_object_path TEXT,
  p_unsigned_sha256 TEXT
)
RETURNS public.committee_report_signatures
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  stored public.committee_report_signatures%ROWTYPE;
BEGIN
  IF p_provider IS NULL OR btrim(p_provider) = '' THEN
    RAISE EXCEPTION 'PROVIDER_NOT_CONFIGURED';
  END IF;
  IF p_pades_profile NOT IN ('B-T', 'B-LT', 'B-LTA') THEN
    RAISE EXCEPTION 'INVALID_PROFILE';
  END IF;
  IF p_unsigned_sha256 !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'INVALID_DIGEST';
  END IF;
  IF p_unsigned_object_path IS NULL
     OR p_unsigned_object_path LIKE '%..%'
     OR p_unsigned_object_path !~ '^[0-9a-f-]+/[0-9a-f-]+/[0-9a-f-]+\.pdf$' THEN
    RAISE EXCEPTION 'INVALID_OBJECT_PATH';
  END IF;

  PERFORM 1
  FROM public.committee_report_snapshots
  WHERE id = p_snapshot_id
    AND invalidated_at IS NULL
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SNAPSHOT';
  END IF;

  INSERT INTO public.committee_report_signatures(
    snapshot_id,
    requested_by,
    provider,
    pades_profile,
    unsigned_object_path,
    unsigned_sha256
  ) VALUES (
    p_snapshot_id,
    p_requested_by,
    btrim(p_provider),
    p_pades_profile,
    p_unsigned_object_path,
    p_unsigned_sha256
  )
  ON CONFLICT (snapshot_id, unsigned_sha256, provider, pades_profile)
    WHERE status <> 'revoked'
  DO UPDATE SET updated_at = public.committee_report_signatures.updated_at
  RETURNING * INTO stored;

  RETURN stored;
END;
$$;

REVOKE ALL ON FUNCTION public.create_committee_report_signature_request(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_committee_report_signature_request(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT
) TO service_role;

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('committee-report-staging', 'committee-report-staging', false, 20971520, ARRAY['application/pdf']),
  ('committee-signed-reports', 'committee-signed-reports', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS committee_admin_upload_report_staging ON storage.objects;
CREATE POLICY committee_admin_upload_report_staging
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'committee-report-staging'
    AND public.is_committee_admin()
    AND name ~ '^[0-9a-f-]+/[0-9a-f-]+/[0-9a-f-]+\.pdf$'
  );

COMMENT ON TABLE public.committee_report_signatures IS
  'Server-managed PAdES signing requests and certificate validation audit metadata.';
COMMENT ON COLUMN public.committee_report_signatures.validation_result IS
  'Normalized validation result only; provider secrets and raw credentials must never be stored.';
COMMENT ON COLUMN public.committee_report_signatures.signed_object_path IS
  'Immutable private object path populated only by the signing service.';

NOTIFY pgrst, 'reload schema';
