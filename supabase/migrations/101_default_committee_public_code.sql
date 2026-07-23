-- Ensure every newly created committee meeting receives an opaque public access code.
-- Migration 091 made public_code NOT NULL but did not define an INSERT default.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.committee_meetings
  ALTER COLUMN public_code
  SET DEFAULT encode(gen_random_bytes(18), 'hex');

UPDATE public.committee_meetings
SET public_code = encode(gen_random_bytes(18), 'hex')
WHERE public_code IS NULL OR btrim(public_code) = '';

ALTER TABLE public.committee_meetings
  ALTER COLUMN public_code SET NOT NULL;

NOTIFY pgrst, 'reload schema';
