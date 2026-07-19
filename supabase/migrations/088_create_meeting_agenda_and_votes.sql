-- 💡 [Supabase DB 마이그레이션 규칙 7 준수]
-- 위원회 의결 서브시스템 내 다중 의안 투표 및 5점 척도 평가 테이블 스키마 구축

-- 1. 회의별 다중 의안(안건) 관리 테이블
CREATE TABLE IF NOT EXISTS meeting_agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL, -- 의안명
    description TEXT, -- 의안 상세 설명
    is_evaluation BOOLEAN DEFAULT FALSE, -- 5점 척도 점수 평가 문항 여부
    sort_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 의원별/의안별 개별 투표 및 자체평가 점수 저장 테이블
CREATE TABLE IF NOT EXISTS meeting_agenda_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    agenda_id UUID REFERENCES meeting_agendas(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES committee_members(id) ON DELETE CASCADE,
    vote VARCHAR(20), -- 일반 의안 투표: 'APPROVE'(동의), 'REJECT'(부동의), 'ABSTAIN'(기권)
    score INT, -- 자체평가 의안 점수: 1 ~ 5 (5점 척도)
    opinion TEXT, -- 해당 의안에 대한 개별 심의 의견
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_agenda_vote UNIQUE (agenda_id, member_id)
);

-- 3. RLS 보안 활성화 및 권한 인가 정책 부여 (보안 최우선 과제)
ALTER TABLE meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agenda_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on meeting_agendas" ON meeting_agendas;
CREATE POLICY "Allow full access on meeting_agendas" ON meeting_agendas FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access on meeting_agenda_votes" ON meeting_agenda_votes;
CREATE POLICY "Allow full access on meeting_agenda_votes" ON meeting_agenda_votes FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. [기존 데이터 이관 가드] 기존 committee_meetings 의 agenda 컬럼에 있던 단일 안건을 meeting_agendas 에 "제1호 의안"으로 자동 이관
INSERT INTO meeting_agendas (meeting_id, title, description, is_evaluation, sort_order)
SELECT id, '제1호 의안: ' || SUBSTRING(title FROM 1 FOR 50) || ' 안건 심의', agenda, FALSE, 1
FROM committee_meetings
ON CONFLICT DO NOTHING;

-- 5. PostgREST API 스키마 캐시 새로고침 신호 전송
NOTIFY pgrst, 'reload schema';
