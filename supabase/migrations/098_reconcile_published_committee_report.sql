-- Reconcile the one published ECC report that predates the canonical roster/vote path.
-- The legacy JSON and published minutes remain unchanged as audit evidence.
DO $$
DECLARE
  target_meeting_id CONSTANT UUID := '956a7b23-c94d-4ef7-9b63-1513d291b432';
  target_committee_id TEXT;
  published_result_id UUID;
  published_at_value TIMESTAMPTZ;
  recorded_member_id BIGINT;
  recovered_chairman_id BIGINT;
  agenda_count INTEGER;
  canonical_result JSONB;
BEGIN
  SELECT m.committee_id
  INTO target_committee_id
  FROM public.committee_meetings m
  WHERE m.id = target_meeting_id
  FOR UPDATE;

  -- A fresh environment has no production row, so this migration is a safe no-op there.
  IF target_committee_id IS NULL THEN
    RETURN;
  END IF;

  SELECT r.id, r.published_at
  INTO published_result_id, published_at_value
  FROM public.meeting_results r
  WHERE r.meeting_id = target_meeting_id
    AND r.is_established = true
    AND r.decision_status = 'APPROVED'
    AND r.official_minutes LIKE '%재적 3명 중 2명 참석%'
  FOR UPDATE;

  IF published_result_id IS NULL THEN
    RAISE EXCEPTION 'PUBLISHED_RESULT_GUARD_FAILED';
  END IF;

  SELECT min(m.id), count(*)
  INTO recorded_member_id, agenda_count
  FROM public.committee_members m
  WHERE m.committee_id = target_committee_id
    AND btrim(m.name) = '이동은';

  IF agenda_count <> 1 OR NOT EXISTS (
    SELECT 1 FROM public.meeting_responses r
    WHERE r.meeting_id = target_meeting_id AND r.member_id = recorded_member_id
  ) THEN
    RAISE EXCEPTION 'RECORDED_MEMBER_GUARD_FAILED';
  END IF;

  SELECT min(m.id), count(*)
  INTO recovered_chairman_id, agenda_count
  FROM public.committee_members m
  WHERE m.committee_id = target_committee_id
    AND m.role_code = 'CHAIRMAN';

  IF agenda_count <> 1 THEN
    RAISE EXCEPTION 'CHAIRMAN_GUARD_FAILED';
  END IF;

  SELECT count(*) INTO agenda_count
  FROM public.meeting_agendas a
  WHERE a.meeting_id = target_meeting_id;

  IF agenda_count <> 3 THEN
    RAISE EXCEPTION 'AGENDA_COUNT_GUARD_FAILED';
  END IF;

  INSERT INTO public.committee_meeting_members(meeting_id, member_id, role_code)
  SELECT target_meeting_id, m.id, m.role_code
  FROM public.committee_members m
  WHERE m.committee_id = target_committee_id
  ON CONFLICT (meeting_id, member_id) DO UPDATE
  SET role_code = EXCLUDED.role_code;

  UPDATE public.meeting_responses
  SET submitted_at = COALESCE(submitted_at, published_at_value),
      updated_at = now()
  WHERE meeting_id = target_meeting_id
    AND member_id = recorded_member_id;

  INSERT INTO public.meeting_responses(
    meeting_id, member_id, attended, vote, opinion, revision, submitted_at, updated_at
  ) VALUES (
    target_meeting_id,
    recovered_chairman_id,
    true,
    'APPROVE',
    '[기록 복구] 확정 보고서의 참석 2명·전 안건 찬성 2표 집계를 정규화했습니다. 원 전자서명은 보존 자료에 존재하지 않습니다.',
    1,
    published_at_value,
    now()
  )
  ON CONFLICT (meeting_id, member_id) DO NOTHING;

  INSERT INTO public.meeting_agenda_votes(
    meeting_id, agenda_id, member_id, vote, score, opinion, submitted_at, updated_at
  )
  SELECT target_meeting_id, a.id, voter.member_id, 'APPROVE', NULL,
         CASE WHEN voter.member_id = recovered_chairman_id
           THEN '[기록 복구] 확정 보고서의 안건별 찬성 2표 집계에서 복원했습니다.'
           ELSE NULL
         END,
         published_at_value,
         now()
  FROM public.meeting_agendas a
  CROSS JOIN (VALUES (recorded_member_id), (recovered_chairman_id)) AS voter(member_id)
  WHERE a.meeting_id = target_meeting_id
  ON CONFLICT (agenda_id, member_id) DO NOTHING;

  SELECT public.get_committee_meeting_result(target_meeting_id)
  INTO canonical_result;

  IF canonical_result->>'decision_status' <> 'APPROVED'
     OR (canonical_result->>'total')::INTEGER <> 3
     OR (canonical_result->>'attended')::INTEGER <> 2 THEN
    RAISE EXCEPTION 'CANONICAL_RESULT_GUARD_FAILED: %', canonical_result;
  END IF;

  INSERT INTO public.committee_vote_migration_issues(
    meeting_id, issue_code, issue_detail, resolved_at
  )
  SELECT target_meeting_id,
         'LEGACY_PUBLISHED_RESULT_RECONCILED',
         jsonb_build_object(
           'meeting_result_id', published_result_id,
           'recorded_member_id', recorded_member_id,
           'recovered_chairman_id', recovered_chairman_id,
           'source', 'published official_minutes and ai_summary',
           'signature_recovered', false
         ),
         now()
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.committee_vote_migration_issues i
    WHERE i.meeting_id = target_meeting_id
      AND i.issue_code = 'LEGACY_PUBLISHED_RESULT_RECONCILED'
  );
END $$;

NOTIFY pgrst, 'reload schema';
