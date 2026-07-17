-- 079_create_seminar_reports_table.sql
-- 지산학 이음 세미나 결과보고 대장 테이블 생성

CREATE TABLE IF NOT EXISTS seminar_reports (
    id SERIAL PRIMARY KEY,
    seminar_id INTEGER UNIQUE NOT NULL, -- 차수 (예: 1, 2, 3, 4, 5, 6 등)
    date TEXT NOT NULL,
    speaker TEXT NOT NULL,
    title TEXT NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 0,
    main_cost BIGINT NOT NULL DEFAULT 0, -- 본예산 집행액 (원)
    carry_cost BIGINT NOT NULL DEFAULT 0, -- 이월예산 집행액 (원)
    satisfaction NUMERIC(3, 1) NOT NULL DEFAULT 0.0, -- 만족도 (예: 4.8)
    etc TEXT, -- 기타 및 특이사항
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS(Row Level Security) 활성화
ALTER TABLE seminar_reports ENABLE ROW LEVEL SECURITY;

-- 1. 모든 사용자에게 조회 허용 (SELECT)
CREATE POLICY "Allow anonymous read access on seminar_reports" 
ON seminar_reports FOR SELECT 
TO public 
USING (true);

-- 2. 모든 사용자에게 등록 허용 (INSERT)
CREATE POLICY "Allow anonymous insert on seminar_reports" 
ON seminar_reports FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. 모든 사용자에게 수정 허용 (UPDATE)
CREATE POLICY "Allow anonymous update on seminar_reports" 
ON seminar_reports FOR UPDATE 
TO public 
USING (true);

-- 4. 모든 사용자에게 삭제 허용 (DELETE)
CREATE POLICY "Allow anonymous delete on seminar_reports" 
ON seminar_reports FOR DELETE 
TO public 
USING (true);
