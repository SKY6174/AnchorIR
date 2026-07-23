-- Committee vote v2: canonical roles, opaque links, sessions, audit, and report seals.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.committee_members
  ADD COLUMN IF NOT EXISTS role_code TEXT,
  ADD COLUMN IF NOT EXISTS user_uuid UUID;

CREATE INDEX IF NOT EXISTS committee_members_user_uuid_idx
  ON public.committee_members(user_uuid)
  WHERE user_uuid IS NOT NULL;

UPDATE public.committee_members
SET role_code = CASE
  WHEN COALESCE(type, '') LIKE '%간사%' THEN 'SECRETARY'
  WHEN COALESCE(type, '') LIKE '%위원장%' THEN 'CHAIRMAN'
  ELSE 'MEMBER'
END
WHERE role_code IS NULL;

ALTER TABLE public.committee_members
  ALTER COLUMN role_code SET DEFAULT 'MEMBER',
  ALTER COLUMN role_code SET NOT NULL;

ALTER TABLE public.committee_members
  DROP CONSTRAINT IF EXISTS committee_members_role_code_check;
ALTER TABLE public.committee_members
  ADD CONSTRAINT committee_members_role_code_check
  CHECK (role_code IN ('CHAIRMAN', 'MEMBER', 'SECRETARY'));

ALTER TABLE public.committee_meetings
  ADD COLUMN IF NOT EXISTS public_code TEXT,
  ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;

UPDATE public.committee_meetings
SET public_code = encode(gen_random_bytes(18), 'hex')
WHERE public_code IS NULL OR btrim(public_code) = '';

ALTER TABLE public.committee_meetings
  ALTER COLUMN public_code SET NOT NULL,
  ALTER COLUMN access_pin DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS committee_meetings_public_code_uidx
  ON public.committee_meetings(public_code);

CREATE TABLE IF NOT EXISTS public.committee_meeting_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES public.committee_members(id) ON DELETE RESTRICT,
  role_code TEXT NOT NULL CHECK (role_code IN ('CHAIRMAN', 'MEMBER', 'SECRETARY')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, member_id)
);

ALTER TABLE public.meeting_agendas
  ADD COLUMN IF NOT EXISTS attachment_path TEXT;

ALTER TABLE public.meeting_responses
  ADD COLUMN IF NOT EXISTS signature_object_path TEXT,
  ADD COLUMN IF NOT EXISTS signature_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.meeting_responses
  DROP CONSTRAINT IF EXISTS meeting_responses_revision_check;
ALTER TABLE public.meeting_responses
  ADD CONSTRAINT meeting_responses_revision_check CHECK (revision > 0);

ALTER TABLE public.meeting_agenda_votes
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.meeting_agenda_votes
  DROP CONSTRAINT IF EXISTS meeting_agenda_votes_vote_check,
  DROP CONSTRAINT IF EXISTS meeting_agenda_votes_score_check;
ALTER TABLE public.meeting_agenda_votes
  ADD CONSTRAINT meeting_agenda_votes_vote_check
    CHECK (vote IS NULL OR vote IN ('APPROVE', 'REJECT', 'ABSTAIN')),
  ADD CONSTRAINT meeting_agenda_votes_score_check
    CHECK (score IS NULL OR score BETWEEN 1 AND 5);

CREATE TABLE IF NOT EXISTS public.committee_vote_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES public.committee_members(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.committee_vote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  meeting_id UUID NOT NULL REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES public.committee_members(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS committee_vote_sessions_lookup_idx
  ON public.committee_vote_sessions(token_hash, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.committee_vote_submission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.committee_vote_sessions(id) ON DELETE CASCADE,
  idempotency_key UUID NOT NULL,
  payload_hash TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.committee_vote_audit_log (
  id BIGSERIAL PRIMARY KEY,
  meeting_id UUID REFERENCES public.committee_meetings(id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES public.committee_members(id) ON DELETE SET NULL,
  actor_user_id UUID,
  event_type TEXT NOT NULL,
  revision INTEGER,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS committee_vote_audit_meeting_idx
  ON public.committee_vote_audit_log(meeting_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.committee_report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  payload JSONB NOT NULL,
  payload_sha256 TEXT NOT NULL CHECK (length(payload_sha256) = 64),
  seal_hmac TEXT NOT NULL,
  finalized_by UUID,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, version)
);

ALTER TABLE public.committee_vote_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_meeting_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_vote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_vote_submission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_vote_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_report_snapshots ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
