-- 002_create_satisfaction_surveys_tables.sql
-- 만족도 조사 메타데이터 및 응답 결과 테이블 정의

CREATE TABLE IF NOT EXISTS satisfaction_surveys (
    id VARCHAR(50) PRIMARY KEY, -- 연도-부서-번호 (예: 2025-ECC-1)
    title VARCHAR(255) NOT NULL, -- 조사제목
    purpose TEXT NOT NULL, -- 조사목적
    start_date DATE NOT NULL, -- 시작일정
    end_date DATE NOT NULL, -- 종료일정
    target VARCHAR(100) NOT NULL, -- 조사대상
    department VARCHAR(100) NOT NULL, -- 수행부서 (ECC, ICC, RCC, AID-X, 늘봄누리센터 등)
    status VARCHAR(20) DEFAULT '작성' CHECK (status IN ('작성', '배포중', '완료')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    google_sheet_url TEXT -- 연동될 구글 시트 주소
);

CREATE TABLE IF NOT EXISTS satisfaction_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id VARCHAR(50) REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
    responder_info VARCHAR(100) DEFAULT '익명', -- 응답자 구분 (예: 재학생, 산업체 관계자 등)
    score_q1 INTEGER CHECK (score_q1 BETWEEN 1 AND 5), -- 5점 리커트 (매우만족:5, 만족:4, 보통:3, 미흡:2, 매우미흡:1)
    score_q2 INTEGER CHECK (score_q2 BETWEEN 1 AND 5),
    score_q3 INTEGER CHECK (score_q3 BETWEEN 1 AND 5),
    score_q4 INTEGER CHECK (score_q4 BETWEEN 1 AND 5),
    score_q5 INTEGER CHECK (score_q5 BETWEEN 1 AND 5),
    comments TEXT, -- 서술형 피드백
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 설정
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on surveys" ON satisfaction_surveys FOR SELECT USING (true);
CREATE POLICY "Allow public insert on surveys" ON satisfaction_surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on surveys" ON satisfaction_surveys FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on surveys" ON satisfaction_surveys FOR DELETE USING (true);

CREATE POLICY "Allow public read on responses" ON satisfaction_responses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on responses" ON satisfaction_responses FOR INSERT WITH CHECK (true);
