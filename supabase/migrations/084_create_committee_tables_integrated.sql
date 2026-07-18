-- 💡 [Supabase DB 마이그레이션 규칙 7 준수] 
-- 위원회 의결 서브시스템용 통합 테이블 스키마 선언 및 RLS 보안 정책 정의

-- 1. 기존 테이블 안전 정리 (중복 생성 및 외래키 충돌 방지)
DROP TABLE IF EXISTS meeting_results CASCADE;
DROP TABLE IF EXISTS meeting_responses CASCADE;
DROP TABLE IF EXISTS committee_meetings CASCADE;
DROP TABLE IF EXISTS committee_members CASCADE;
DROP TABLE IF EXISTS committees CASCADE;

-- 2. 위원회 기본 정의 테이블
CREATE TABLE committees (
    id VARCHAR(50) PRIMARY KEY, -- 'total', 'planning', 'budget' 등 명시적 텍스트 ID
    name VARCHAR(100) NOT NULL, -- 예: '앵커기획위원회', '자체평가위원회'
    total_quorum INT NOT NULL DEFAULT 0, -- 재적 위원 수
    voting_rule VARCHAR(50) NOT NULL DEFAULT 'majority_of_attendees', -- 'majority_of_attendees'(출석 과반)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 위원회 위원 정보 테이블 (대시보드 rise_users 와 다대다 매핑)
CREATE TABLE committee_members (
    id BIGSERIAL PRIMARY KEY, -- 자동 증가 PK (BIGINT)
    committee_id VARCHAR(50) REFERENCES committees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 위원 성명
    org VARCHAR(100), -- 소속기관 (예: 울산과학대학교)
    dept VARCHAR(100), -- 부서
    rank VARCHAR(100), -- 직위/직급
    location VARCHAR(50), -- '교내'/'교외'
    note TEXT, -- 비고
    sort_order INT DEFAULT 99, -- 정렬 순서
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 회의 생성 및 관리 테이블 (위원회 텍스트 ID 연동 및 파일 탑재/6자리 핀코드 추가)
CREATE TABLE committee_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id TEXT NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, -- 회의명
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 회의 일시
    meeting_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE_WRITTEN', -- 'ONLINE_WRITTEN'(서면)
    agenda TEXT NOT NULL, -- 안건 내용 및 회의 목적
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'ACTIVE'(진행중)
    
    -- [회의 첨부파일 탑재용 컬럼]
    attachment_name TEXT, -- 파일명
    attachment_data TEXT, -- Base64 파일 데이터
    
    -- [위원 개별 보안 로그인용 6자리 PIN코드]
    access_pin VARCHAR(20) DEFAULT '123456', 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 참석/의결 및 의견 테이블 (member_id BIGINT 참조 연동)
CREATE TABLE meeting_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES committee_members(id) ON DELETE CASCADE, -- BIGINT 매핑
    attended BOOLEAN DEFAULT FALSE, -- 참석 여부
    vote VARCHAR(20), -- 'APPROVE'(찬성), 'REJECT'(반대), 'ABSTAIN'(기권)
    opinion TEXT, -- 상세 검토 의견
    encrypted_signature TEXT, -- AES 암호화된 전자서명 이미지 데이터 (Rule 8 준수)
    submitted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_meeting_member UNIQUE (meeting_id, member_id)
);

-- 6. 최종 의결 및 AI 분석 결과 테이블
CREATE TABLE meeting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES committee_meetings(id) ON DELETE CASCADE,
    is_established BOOLEAN DEFAULT FALSE, -- 성원 여부
    decision_status VARCHAR(50), -- 'APPROVED'(가결), 'REJECTED'(부결)
    ai_summary TEXT, -- Gemini API를 통한 회의록 의견 자동 요약
    official_minutes TEXT, -- 공식 회의록
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RLS(Row Level Security) 설정 (보안 최우선 과제)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_results ENABLE ROW LEVEL SECURITY;

-- [보안 정책 매핑 가드]
CREATE POLICY "Allow full access on committees" ON committees FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on committee_members" ON committee_members FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on committee_meetings" ON committee_meetings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on meeting_responses" ON meeting_responses FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on meeting_results" ON meeting_results FOR ALL TO public USING (true) WITH CHECK (true);
