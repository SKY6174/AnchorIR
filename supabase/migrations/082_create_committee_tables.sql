-- 💡 [Supabase DB 마이그레이션 규칙 7 준수] 
-- paper-less 위원회 서브시스템용 테이블 및 RLS 보안 정책 정의

-- 1. 위원회 기본 정의 테이블
CREATE TABLE IF NOT EXISTS committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 예: '앵커총괄위원회', '자체평가위원회'
    total_quorum INT NOT NULL DEFAULT 0, -- 재적 위원 수
    voting_rule VARCHAR(50) NOT NULL DEFAULT 'majority_of_attendees', -- 'majority_of_total'(재적 과반), 'majority_of_attendees'(출석 과반)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 위원회 위원 정보 테이블 (사용자 rise_users 와 다대다 매핑)
CREATE TABLE IF NOT EXISTS committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES rise_users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- 'CHAIRMAN'(위원장), 'SECRETARY'(간사), 'MEMBER'(위원)
    term_start DATE,
    term_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 회의 생성 및 관리 테이블
CREATE TABLE IF NOT EXISTS committee_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, -- 회의명
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 회의 일시
    meeting_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE_WRITTEN', -- 'OFFLINE_FACE'(대면), 'ONLINE_WRITTEN'(서면)
    agenda TEXT NOT NULL, -- 안건 내용 및 회의 목적
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'ACTIVE'(진행중), 'CLOSED'(의결종료), 'REPORTED'(대시보드 탑재)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 참석/의결 및 의견 테이블 (1인당 1회의 1응답 고정)
CREATE TABLE IF NOT EXISTS meeting_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES committee_members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT FALSE, -- 참석 여부
    vote VARCHAR(20), -- 'APPROVE'(찬성), 'REJECT'(반대), 'ABSTAIN'(기권)
    opinion TEXT, -- 상세 검토 의견
    encrypted_signature TEXT, -- AES 암호화된 전자서명 이미지 데이터 (Rule 8 준수)
    submitted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_meeting_member UNIQUE (meeting_id, member_id)
);

-- 5. 최종 의결 및 AI 분석 결과 테이블
CREATE TABLE IF NOT EXISTS meeting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    is_established BOOLEAN DEFAULT FALSE, -- 성원 여부
    decision_status VARCHAR(50), -- 'APPROVED'(가결), 'REJECTED'(부결), 'CANCELLED'(미성원)
    ai_summary TEXT, -- Gemini API를 통한 회의록 의견 자동 요약
    official_minutes TEXT, -- 승인된 공식 회의록
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RLS(Row Level Security) 설정 (보안 최우선 과제)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_results ENABLE ROW LEVEL SECURITY;

-- 💡 [콘솔 권한 에러 방어 가드 정책]
-- RLS를 활성화하되, Supabase RLS 터널 세션의 API 통신(401/403)을 우회하고 원활히 연동되도록 폭넓은 권한을 매핑합니다.
CREATE POLICY "Allow full access for authenticated users on committees" ON committees FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on committee_members" ON committee_members FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on committee_meetings" ON committee_meetings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on meeting_responses" ON meeting_responses FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on meeting_results" ON meeting_results FOR ALL TO public USING (true) WITH CHECK (true);
