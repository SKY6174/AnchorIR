-- Backfill diagnostics are intentionally non-destructive. Legacy JSON remains available for audit.
CREATE TABLE IF NOT EXISTS public.committee_vote_migration_issues (
  id BIGSERIAL PRIMARY KEY,
  meeting_id UUID REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  issue_code TEXT NOT NULL,
  issue_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.committee_vote_migration_issues ENABLE ROW LEVEL SECURITY;

WITH unique_user_matches AS (
  SELECT m.id AS member_id, (array_agg(u.uuid ORDER BY u.uuid))[1] AS user_uuid
  FROM public.committee_members m
  JOIN public.rise_users u
    ON split_part(btrim(u.name), ' ', 1) = btrim(m.name)
   AND u.approved = true
   AND u.uuid IS NOT NULL
  GROUP BY m.id
  HAVING count(*) = 1
)
UPDATE public.committee_members m
SET user_uuid = match.user_uuid
FROM unique_user_matches match
WHERE m.id = match.member_id AND m.user_uuid IS NULL;

INSERT INTO public.committee_vote_migration_issues (issue_code, issue_detail)
SELECT 'MEMBER_AUTH_MAPPING_MISSING', jsonb_build_object('member_id', m.id, 'name', m.name, 'committee_id', m.committee_id)
FROM public.committee_members m
WHERE m.user_uuid IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.committee_vote_migration_issues (meeting_id, issue_code, issue_detail)
SELECT meeting_id, 'DUPLICATE_MEMBER_RESPONSE', jsonb_build_object('member_id', member_id, 'count', count(*))
FROM public.meeting_responses
GROUP BY meeting_id, member_id
HAVING count(*) > 1
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'committee_meetings' AND column_name = 'responses_data'
  ) THEN
    EXECUTE $migration$
      INSERT INTO public.committee_vote_migration_issues(meeting_id, issue_code, issue_detail)
      SELECT mtg.id, 'LEGACY_RESPONSE_MEMBER_UNMAPPED',
             jsonb_build_object('member_id', response.item->>'member_id', 'member_name', response.item->>'member_name')
      FROM public.committee_meetings mtg
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(mtg.responses_data) = 'array' THEN mtg.responses_data ELSE '[]'::jsonb END
      ) response(item)
      LEFT JOIN LATERAL (
        SELECT min(member.id) AS member_id, count(*) AS match_count
        FROM public.committee_members member
        WHERE member.committee_id = mtg.committee_id
          AND (
            member.id::text = response.item->>'member_id'
            OR lower(btrim(member.name)) = lower(btrim(response.item->>'member_name'))
          )
      ) matched ON true
      WHERE matched.match_count <> 1
    $migration$;

    EXECUTE $migration$
      INSERT INTO public.meeting_responses(
        meeting_id, member_id, attended, vote, opinion, encrypted_signature,
        revision, submitted_at, updated_at
      )
      SELECT mtg.id, matched.member_id,
             CASE lower(COALESCE(response.item->>'attended', 'true')) WHEN 'false' THEN false ELSE true END,
             CASE WHEN response.item->>'vote' IN ('APPROVE', 'REJECT', 'ABSTAIN') THEN response.item->>'vote' ELSE NULL END,
             NULLIF(response.item->>'opinion', ''),
             COALESCE(NULLIF(response.item->>'encrypted_signature', ''), NULLIF(response.item->>'signature', '')),
             1, NULL, now()
      FROM public.committee_meetings mtg
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(mtg.responses_data) = 'array' THEN mtg.responses_data ELSE '[]'::jsonb END
      ) response(item)
      JOIN LATERAL (
        SELECT min(member.id) AS member_id, count(*) AS match_count
        FROM public.committee_members member
        WHERE member.committee_id = mtg.committee_id
          AND (
            member.id::text = response.item->>'member_id'
            OR lower(btrim(member.name)) = lower(btrim(response.item->>'member_name'))
          )
      ) matched ON matched.match_count = 1
      ON CONFLICT (meeting_id, member_id) DO NOTHING
    $migration$;
  END IF;
END $$;

INSERT INTO public.committee_vote_migration_issues (meeting_id, issue_code, issue_detail)
SELECT v.meeting_id, 'AGENDA_MEETING_MISMATCH', jsonb_build_object('vote_id', v.id, 'agenda_id', v.agenda_id)
FROM public.meeting_agenda_votes v
JOIN public.meeting_agendas a ON a.id = v.agenda_id
WHERE a.meeting_id <> v.meeting_id
ON CONFLICT DO NOTHING;

INSERT INTO public.committee_vote_migration_issues (meeting_id, issue_code, issue_detail)
SELECT r.meeting_id, 'MEMBER_COMMITTEE_MISMATCH', jsonb_build_object('response_id', r.id, 'member_id', r.member_id)
FROM public.meeting_responses r
JOIN public.committee_meetings mtg ON mtg.id = r.meeting_id
JOIN public.committee_members mem ON mem.id = r.member_id
WHERE mem.committee_id <> mtg.committee_id
ON CONFLICT DO NOTHING;

CREATE OR REPLACE VIEW public.committee_vote_migration_summary AS
SELECT issue_code, count(*) AS issue_count, count(*) FILTER (WHERE resolved_at IS NULL) AS unresolved_count
FROM public.committee_vote_migration_issues
GROUP BY issue_code;

NOTIFY pgrst, 'reload schema';
