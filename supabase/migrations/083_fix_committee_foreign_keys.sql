-- 💡 [Supabase DB 마이그레이션 규칙 7 준수]
-- 신규 위원회 회의 테이블들과 기존 committees(id TEXT) / committee_members(id BIGINT) 테이블 간의 타입 불일치 교정
-- 첨부 파일 업로드 및 위원 전용 보안 핀코드(Access PIN) 컬럼 추가

-- 기존 생성된 신규 테이블들의 의존성 제거 후 드롭 및 재생성
DROP TABLE IF EXISTS meeting_results CASCADE;
DROP TABLE IF EXISTS meeting_responses CASCADE;
DROP TABLE IF EXISTS committee_meetings CASCADE;

-- 1. 회의 생성 및 관리 테이블 (committee_id TEXT 참조 및 파일 탑재/핀코드 컬럼 추가)
CREATE TABLE committee_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id TEXT NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, -- 회의명
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 회의 일시
    meeting_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE_WRITTEN', -- 'OFFLINE_FACE'(대면), 'ONLINE_WRITTEN'(서면)
    agenda TEXT NOT NULL, -- 안건 내용 및 회의 목적
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'ACTIVE'(진행중), 'CLOSED'(의결종료), 'REPORTED'(대시보드 탑재)
    
    -- 💡 [회의 첨부파일 탑재용 컬럼 추가] (요구사항 3 반영)
    attachment_name TEXT, -- 파일명
    attachment_data TEXT, -- Base64 파일 내용
    
    -- 💡 [위원 개별 보안 로그인용 PIN코드 추가] (요구사항 4 반영)
    access_pin VARCHAR(20) DEFAULT '123456', -- 위원 핀코드 (기본값)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 참석/의결 및 의견 테이블 (member_id BIGINT 참조로 교정)
CREATE TABLE meeting_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES committee_members(id) ON DELETE CASCADE, -- BIGINT 타입 매핑 연동
    attended BOOLEAN DEFAULT FALSE, -- 참석 여부
    vote VARCHAR(20), -- 'APPROVE'(찬성), 'REJECT'(반대), 'ABSTAIN'(기권)
    opinion TEXT, -- 상세 검토 의견
    encrypted_signature TEXT, -- AES 암호화된 전자서명 이미지 데이터 (Rule 8 준수)
    submitted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_meeting_member UNIQUE (meeting_id, member_id)
);

-- 3. 최종 의결 및 AI 분석 결과 테이블 (재생성)
CREATE TABLE meeting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    is_established BOOLEAN DEFAULT FALSE, -- 성원 여부
    decision_status VARCHAR(50), -- 'APPROVED'(가결), 'REJECTED'(부결), 'CANCELLED'(미성원)
    ai_summary TEXT, -- Gemini API를 통한 회의록 의견 자동 요약
    official_minutes TEXT, -- 승인된 공식 회의록
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RLS 활성화 및 권한 설정
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users on committee_meetings" ON committee_meetings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on meeting_responses" ON meeting_responses FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users on meeting_results" ON meeting_results FOR ALL TO public USING (true) WITH CHECK (true);
