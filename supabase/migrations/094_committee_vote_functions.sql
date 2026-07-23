-- Security-definer functions are the only write boundary for external committee voters.

CREATE OR REPLACE FUNCTION public.issue_committee_voter_credential(
  p_meeting_id UUID,
  p_member_id BIGINT,
  p_pin TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  member_role TEXT;
BEGIN
  IF NOT public.is_committee_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  IF p_pin !~ '^[0-9]{6}$' OR p_pin IN ('123456', '1234') THEN
    RAISE EXCEPTION 'WEAK_PIN';
  END IF;

  SELECT m.role_code INTO member_role
  FROM public.committee_members m
  JOIN public.committee_meetings mtg ON mtg.committee_id = m.committee_id
  WHERE mtg.id = p_meeting_id AND m.id = p_member_id;
  IF member_role IS NULL THEN
    RAISE EXCEPTION 'MEMBER_COMMITTEE_MISMATCH';
  END IF;

  INSERT INTO public.committee_meeting_members(meeting_id, member_id, role_code)
  VALUES (p_meeting_id, p_member_id, member_role)
  ON CONFLICT (meeting_id, member_id) DO UPDATE SET role_code = EXCLUDED.role_code;

  INSERT INTO public.committee_vote_credentials(
    meeting_id, member_id, pin_hash, expires_at, failed_attempts,
    locked_until, revoked_at, created_by, updated_at
  ) VALUES (
    p_meeting_id, p_member_id, crypt(p_pin, gen_salt('bf', 12)), p_expires_at,
    0, NULL, NULL, auth.uid(), now()
  )
  ON CONFLICT (meeting_id, member_id) DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    expires_at = EXCLUDED.expires_at,
    failed_attempts = 0,
    locked_until = NULL,
    revoked_at = NULL,
    created_by = EXCLUDED.created_by,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_committee_meeting_credentials(
  p_meeting_id UUID,
  p_pin TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  meeting_committee_id TEXT;
  issued_count INTEGER;
BEGIN
  IF NOT public.is_committee_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF p_pin !~ '^[0-9]{6}$' OR p_pin IN ('123456', '1234') THEN RAISE EXCEPTION 'WEAK_PIN'; END IF;

  SELECT committee_id INTO meeting_committee_id
  FROM public.committee_meetings WHERE id = p_meeting_id FOR UPDATE;
  IF meeting_committee_id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.committee_meeting_members WHERE meeting_id = p_meeting_id) THEN
    INSERT INTO public.committee_meeting_members(meeting_id, member_id, role_code)
    SELECT p_meeting_id, id, role_code
    FROM public.committee_members
    WHERE committee_id = meeting_committee_id;
  END IF;

  INSERT INTO public.committee_vote_credentials(
    meeting_id, member_id, pin_hash, expires_at, failed_attempts,
    locked_until, revoked_at, created_by, updated_at
  )
  SELECT p_meeting_id, mm.member_id, crypt(p_pin, gen_salt('bf', 12)), p_expires_at,
         0, NULL, NULL, auth.uid(), now()
  FROM public.committee_meeting_members mm
  WHERE mm.meeting_id = p_meeting_id
  ON CONFLICT (meeting_id, member_id) DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    expires_at = EXCLUDED.expires_at,
    failed_attempts = 0,
    locked_until = NULL,
    revoked_at = NULL,
    created_by = EXCLUDED.created_by,
    updated_at = now();

  GET DIAGNOSTICS issued_count = ROW_COUNT;
  UPDATE public.committee_vote_sessions SET revoked_at = now()
  WHERE meeting_id = p_meeting_id AND revoked_at IS NULL;
  RETURN issued_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.authenticate_committee_voter(
  p_access_code TEXT,
  p_name TEXT,
  p_pin TEXT,
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  meeting_row public.committee_meetings%ROWTYPE;
  member_row public.committee_members%ROWTYPE;
  credential_row public.committee_vote_credentials%ROWTYPE;
  matched_count INTEGER;
  matched_member_id BIGINT;
  session_id UUID;
BEGIN
  IF length(COALESCE(p_token_hash, '')) <> 64 OR length(COALESCE(p_pin, '')) > 32 OR length(COALESCE(p_name, '')) > 100 THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;

  SELECT * INTO meeting_row
  FROM public.committee_meetings
  WHERE public_code = btrim(p_access_code);
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_CREDENTIALS'; END IF;
  IF meeting_row.status <> 'ACTIVE' OR (meeting_row.closes_at IS NOT NULL AND meeting_row.closes_at <= now()) THEN
    RAISE EXCEPTION 'MEETING_CLOSED';
  END IF;

  SELECT count(*), min(m.id) INTO matched_count, matched_member_id
  FROM public.committee_members m
  JOIN public.committee_meeting_members mm ON mm.member_id = m.id AND mm.meeting_id = meeting_row.id
  WHERE lower(btrim(m.name)) = lower(btrim(p_name));
  IF matched_count <> 1 THEN RAISE EXCEPTION 'INVALID_CREDENTIALS'; END IF;

  SELECT * INTO member_row FROM public.committee_members WHERE id = matched_member_id;
  SELECT * INTO credential_row
  FROM public.committee_vote_credentials
  WHERE meeting_id = meeting_row.id AND member_id = member_row.id
  FOR UPDATE;
  IF NOT FOUND OR credential_row.revoked_at IS NOT NULL
     OR (credential_row.expires_at IS NOT NULL AND credential_row.expires_at <= now()) THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;
  IF credential_row.locked_until IS NOT NULL AND credential_row.locked_until > now() THEN
    RAISE EXCEPTION 'LOCKED';
  END IF;

  IF crypt(p_pin, credential_row.pin_hash) <> credential_row.pin_hash THEN
    UPDATE public.committee_vote_credentials
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END,
        updated_at = now()
    WHERE id = credential_row.id;
    RETURN jsonb_build_object(
      'error_code', CASE WHEN credential_row.failed_attempts + 1 >= 5 THEN 'LOCKED' ELSE 'INVALID_CREDENTIALS' END
    );
  END IF;

  UPDATE public.committee_vote_credentials
  SET failed_attempts = 0, locked_until = NULL, updated_at = now()
  WHERE id = credential_row.id;

  INSERT INTO public.committee_vote_sessions(
    token_hash, meeting_id, member_id, expires_at, created_ip_hash, user_agent_hash
  ) VALUES (
    p_token_hash, meeting_row.id, member_row.id, LEAST(p_expires_at, now() + interval '60 minutes'),
    p_ip_hash, p_user_agent_hash
  ) RETURNING id INTO session_id;

  INSERT INTO public.committee_vote_audit_log(meeting_id, member_id, event_type, event_data)
  VALUES (meeting_row.id, member_row.id, 'VOTER_AUTHENTICATED', jsonb_build_object('session_id', session_id));

  RETURN jsonb_build_object(
    'member', jsonb_build_object(
      'id', member_row.id, 'name', member_row.name, 'type', member_row.type,
      'role_code', member_row.role_code, 'org', member_row.org,
      'dept', member_row.dept, 'rank', member_row.rank
    ),
    'meeting_id', meeting_row.id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_committee_vote(
  p_token_hash TEXT,
  p_idempotency_key UUID,
  p_signature_object_path TEXT,
  p_signature_sha256 TEXT,
  p_votes JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  session_row public.committee_vote_sessions%ROWTYPE;
  meeting_row public.committee_meetings%ROWTYPE;
  request_row public.committee_vote_submission_requests%ROWTYPE;
  vote_item JSONB;
  agenda_row public.meeting_agendas%ROWTYPE;
  payload_hash TEXT;
  agenda_count INTEGER;
  submitted_agenda_count INTEGER;
  next_revision INTEGER;
  first_vote TEXT;
  combined_opinion TEXT;
  result_payload JSONB;
BEGIN
  IF jsonb_typeof(p_votes) <> 'array' OR jsonb_array_length(p_votes) = 0
     OR length(COALESCE(p_token_hash, '')) <> 64
     OR length(COALESCE(p_signature_sha256, '')) <> 64 THEN
    RAISE EXCEPTION 'INCOMPLETE_AGENDAS';
  END IF;

  SELECT * INTO session_row
  FROM public.committee_vote_sessions
  WHERE token_hash = p_token_hash
  FOR UPDATE;
  IF NOT FOUND OR session_row.revoked_at IS NOT NULL OR session_row.expires_at <= now() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT * INTO meeting_row
  FROM public.committee_meetings
  WHERE id = session_row.meeting_id
  FOR UPDATE;
  IF meeting_row.status <> 'ACTIVE' OR (meeting_row.closes_at IS NOT NULL AND meeting_row.closes_at <= now()) THEN
    RAISE EXCEPTION 'MEETING_CLOSED';
  END IF;

  payload_hash := encode(digest(convert_to(p_votes::text || p_signature_sha256, 'UTF8'), 'sha256'), 'hex');
  SELECT * INTO request_row
  FROM public.committee_vote_submission_requests
  WHERE session_id = session_row.id AND idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF request_row.payload_hash <> payload_hash THEN RAISE EXCEPTION 'CONFLICT'; END IF;
    RETURN request_row.result || jsonb_build_object('idempotent_replay', true);
  END IF;

  SELECT count(*) INTO agenda_count
  FROM public.meeting_agendas WHERE meeting_id = meeting_row.id;
  SELECT count(DISTINCT value->>'agenda_id') INTO submitted_agenda_count
  FROM jsonb_array_elements(p_votes);
  IF agenda_count = 0 OR submitted_agenda_count <> agenda_count OR jsonb_array_length(p_votes) <> agenda_count THEN
    RAISE EXCEPTION 'INCOMPLETE_AGENDAS';
  END IF;

  FOR vote_item IN SELECT value FROM jsonb_array_elements(p_votes)
  LOOP
    SELECT * INTO agenda_row
    FROM public.meeting_agendas
    WHERE id = (vote_item->>'agenda_id')::uuid AND meeting_id = meeting_row.id;
    IF NOT FOUND THEN RAISE EXCEPTION 'INCOMPLETE_AGENDAS'; END IF;

    IF agenda_row.is_evaluation THEN
      IF vote_item->>'vote' IS NOT NULL
         OR COALESCE(vote_item->>'score', '') !~ '^[1-5]$' THEN
        RAISE EXCEPTION 'INCOMPLETE_AGENDAS';
      END IF;
    ELSE
      IF COALESCE(vote_item->>'vote', '') NOT IN ('APPROVE', 'REJECT', 'ABSTAIN')
         OR vote_item->>'score' IS NOT NULL THEN
        RAISE EXCEPTION 'INCOMPLETE_AGENDAS';
      END IF;
    END IF;
  END LOOP;

  SELECT COALESCE(max(revision), 0) + 1 INTO next_revision
  FROM public.meeting_responses
  WHERE meeting_id = meeting_row.id AND member_id = session_row.member_id;
  SELECT value->>'vote' INTO first_vote
  FROM jsonb_array_elements(p_votes)
  WHERE value->>'vote' IS NOT NULL LIMIT 1;
  SELECT string_agg(COALESCE(value->>'opinion', ''), E'\n') INTO combined_opinion
  FROM jsonb_array_elements(p_votes);

  INSERT INTO public.meeting_responses(
    meeting_id, member_id, attended, vote, opinion, encrypted_signature,
    signature_object_path, signature_sha256, revision, submitted_at, updated_at
  ) VALUES (
    meeting_row.id, session_row.member_id, true, first_vote, combined_opinion, NULL,
    p_signature_object_path, p_signature_sha256, next_revision, now(), now()
  )
  ON CONFLICT (meeting_id, member_id) DO UPDATE SET
    attended = true,
    vote = EXCLUDED.vote,
    opinion = EXCLUDED.opinion,
    encrypted_signature = NULL,
    signature_object_path = EXCLUDED.signature_object_path,
    signature_sha256 = EXCLUDED.signature_sha256,
    revision = public.meeting_responses.revision + 1,
    submitted_at = now(),
    updated_at = now()
  RETURNING revision INTO next_revision;

  FOR vote_item IN SELECT value FROM jsonb_array_elements(p_votes)
  LOOP
    INSERT INTO public.meeting_agenda_votes(
      meeting_id, agenda_id, member_id, vote, score, opinion, submitted_at, updated_at
    ) VALUES (
      meeting_row.id, (vote_item->>'agenda_id')::uuid, session_row.member_id,
      NULLIF(vote_item->>'vote', ''), NULLIF(vote_item->>'score', '')::integer,
      left(COALESCE(vote_item->>'opinion', ''), 10000), now(), now()
    )
    ON CONFLICT (agenda_id, member_id) DO UPDATE SET
      vote = EXCLUDED.vote,
      score = EXCLUDED.score,
      opinion = EXCLUDED.opinion,
      submitted_at = now(),
      updated_at = now();
  END LOOP;

  UPDATE public.committee_vote_sessions SET last_used_at = now() WHERE id = session_row.id;
  result_payload := jsonb_build_object('revision', next_revision, 'submitted_at', now());

  INSERT INTO public.committee_vote_submission_requests(session_id, idempotency_key, payload_hash, result)
  VALUES (session_row.id, p_idempotency_key, payload_hash, result_payload);
  INSERT INTO public.committee_vote_audit_log(meeting_id, member_id, event_type, revision, event_data)
  VALUES (meeting_row.id, session_row.member_id, 'VOTE_SUBMITTED', next_revision,
    jsonb_build_object('idempotency_key', p_idempotency_key, 'payload_hash', payload_hash));

  RETURN result_payload;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_committee_meeting_result(p_meeting_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH roster AS (
    SELECT member_id, role_code
    FROM public.committee_meeting_members
    WHERE meeting_id = p_meeting_id AND role_code <> 'SECRETARY'
  ), attendance AS (
    SELECT count(*)::integer AS attended
    FROM public.meeting_responses r
    JOIN roster ro ON ro.member_id = r.member_id
    WHERE r.meeting_id = p_meeting_id AND r.attended = true
  ), quorum AS (
    SELECT count(*)::integer AS total,
           a.attended,
           (floor(count(*) / 2.0) + 1)::integer AS required_attendance,
           (floor(a.attended / 2.0) + 1)::integer AS required_approval
    FROM roster CROSS JOIN attendance a
    GROUP BY a.attended
  ), agenda_results AS (
    SELECT a.id, a.title, a.is_evaluation, a.sort_order,
      count(v.*) FILTER (WHERE ro.member_id IS NOT NULL)::integer AS response_count,
      count(v.*) FILTER (WHERE ro.member_id IS NOT NULL AND v.vote = 'APPROVE')::integer AS approve_count,
      count(v.*) FILTER (WHERE ro.member_id IS NOT NULL AND v.vote = 'REJECT')::integer AS reject_count,
      count(v.*) FILTER (WHERE ro.member_id IS NOT NULL AND v.vote = 'ABSTAIN')::integer AS abstain_count,
      avg(v.score) FILTER (WHERE ro.member_id IS NOT NULL AND v.score IS NOT NULL) AS average_score
    FROM public.meeting_agendas a
    LEFT JOIN public.meeting_agenda_votes v ON v.agenda_id = a.id
    LEFT JOIN roster ro ON ro.member_id = v.member_id
    WHERE a.meeting_id = p_meeting_id
    GROUP BY a.id, a.title, a.is_evaluation, a.sort_order
  ), packaged AS (
    SELECT q.*,
      q.attended >= q.required_attendance AS is_established,
      COALESCE(jsonb_agg(jsonb_build_object(
        'agenda_id', ar.id, 'title', ar.title, 'is_evaluation', ar.is_evaluation,
        'response_count', ar.response_count, 'approve_count', ar.approve_count,
        'reject_count', ar.reject_count, 'abstain_count', ar.abstain_count,
        'average_score', ar.average_score,
        'decision_status', CASE
          WHEN ar.is_evaluation THEN 'EVALUATION'
          WHEN q.attended < q.required_attendance THEN 'CANCELLED_NO_QUORUM'
          WHEN ar.approve_count >= q.required_approval THEN 'APPROVED'
          ELSE 'REJECTED' END
      ) ORDER BY ar.sort_order), '[]'::jsonb) AS agendas
    FROM quorum q LEFT JOIN agenda_results ar ON true
    GROUP BY q.total, q.attended, q.required_attendance, q.required_approval
  )
  SELECT jsonb_build_object(
    'total', total, 'attended', attended,
    'required_attendance', required_attendance,
    'required_approval', required_approval,
    'is_established', is_established,
    'decision_status', CASE
      WHEN NOT is_established THEN 'CANCELLED_NO_QUORUM'
      WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(agendas) x WHERE x->>'decision_status' = 'REJECTED') THEN 'REJECTED'
      WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(agendas) x WHERE x->>'decision_status' = 'APPROVED') THEN 'APPROVED'
      ELSE 'PENDING' END,
    'agendas', agendas
  ) FROM packaged;
$$;

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
  IF length(p_payload_sha256) <> 64 OR length(p_seal_hmac) < 32 THEN RAISE EXCEPTION 'INVALID_SEAL'; END IF;
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

REVOKE ALL ON FUNCTION public.issue_committee_voter_credential(UUID, BIGINT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_committee_voter_credential(UUID, BIGINT, TEXT, TIMESTAMPTZ) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.issue_committee_meeting_credentials(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_committee_meeting_credentials(UUID, TEXT, TIMESTAMPTZ) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.authenticate_committee_voter(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_committee_voter(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.submit_committee_vote(TEXT, UUID, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_committee_vote(TEXT, UUID, TEXT, TEXT, JSONB) TO service_role;
REVOKE ALL ON FUNCTION public.get_committee_meeting_result(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_committee_meeting_result(UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.store_committee_report_snapshot(UUID, JSONB, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_committee_report_snapshot(UUID, JSONB, TEXT, TEXT, UUID) TO service_role;

NOTIFY pgrst, 'reload schema';
