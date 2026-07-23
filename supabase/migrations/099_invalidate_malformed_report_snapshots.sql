-- Preserve malformed historical snapshots for audit, but never verify them as valid reports.
ALTER TABLE public.committee_report_snapshots
  ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invalid_reason TEXT;

UPDATE public.committee_report_snapshots
SET invalidated_at = COALESCE(invalidated_at, now()),
    invalid_reason = COALESCE(invalid_reason, 'REPORT_RESULT_UNAVAILABLE')
WHERE (
    jsonb_typeof(payload) <> 'object'
    OR jsonb_typeof(payload->'result') <> 'object'
    OR COALESCE(payload #>> '{result,decision_status}', '') = ''
  )
  AND invalidated_at IS NULL;

ALTER TABLE public.committee_report_snapshots
  DROP CONSTRAINT IF EXISTS committee_report_snapshots_invalidation_check;
ALTER TABLE public.committee_report_snapshots
  ADD CONSTRAINT committee_report_snapshots_invalidation_check
  CHECK (
    (invalidated_at IS NULL AND invalid_reason IS NULL)
    OR (invalidated_at IS NOT NULL AND length(btrim(invalid_reason)) > 0)
  );

CREATE OR REPLACE FUNCTION public.store_committee_report_snapshot(
  p_meeting_id UUID,
  p_payload JSONB,
  p_payload_sha256 TEXT,
  p_seal_hmac TEXT,
  p_finalized_by UUID
)
RETURNS public.committee_report_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  next_version INTEGER;
  stored public.committee_report_snapshots%ROWTYPE;
BEGIN
  IF length(p_payload_sha256) <> 64 OR length(p_seal_hmac) < 32 THEN
    RAISE EXCEPTION 'INVALID_SEAL';
  END IF;
  IF jsonb_typeof(p_payload) <> 'object'
     OR jsonb_typeof(p_payload->'result') <> 'object'
     OR COALESCE(p_payload #>> '{result,decision_status}', '') = '' THEN
    RAISE EXCEPTION 'REPORT_RESULT_UNAVAILABLE';
  END IF;

  PERFORM 1 FROM public.committee_meetings WHERE id = p_meeting_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  SELECT COALESCE(max(version), 0) + 1 INTO next_version
  FROM public.committee_report_snapshots WHERE meeting_id = p_meeting_id;

  INSERT INTO public.committee_report_snapshots(
    meeting_id, version, payload, payload_sha256, seal_hmac, finalized_by
  ) VALUES (
    p_meeting_id, next_version, p_payload, p_payload_sha256, p_seal_hmac, p_finalized_by
  ) RETURNING * INTO stored;

  RETURN stored;
END;
$$;

REVOKE ALL ON FUNCTION public.store_committee_report_snapshot(UUID, JSONB, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_committee_report_snapshot(UUID, JSONB, TEXT, TEXT, UUID)
  TO service_role;

COMMENT ON COLUMN public.committee_report_snapshots.invalidated_at IS
  'Set when a sealed payload is retained for audit but must not be accepted as a valid report.';
COMMENT ON COLUMN public.committee_report_snapshots.invalid_reason IS
  'Stable reason code explaining why the retained snapshot is invalid.';

NOTIFY pgrst, 'reload schema';
