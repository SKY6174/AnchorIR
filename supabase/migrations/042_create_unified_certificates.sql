-- 1. unified_certificates (통합 상장 및 이수증) 테이블 신설
CREATE TABLE IF NOT EXISTS unified_certificates (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    cert_no TEXT,
    cert_type TEXT NOT NULL, -- '상장', '수료증', '이수증' 등
    award_type TEXT, -- 상훈
    team_name TEXT,
    recipient_name TEXT NOT NULL,
    student_id TEXT,
    birth_date TEXT,
    phone TEXT,
    issue_date DATE,
    project_group TEXT,
    issuer TEXT,
    content TEXT,
    manager_dept TEXT,
    manager_name TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. RLS 활성화
ALTER TABLE unified_certificates ENABLE ROW LEVEL SECURITY;

-- 3. 정책 설정 (익명 및 인증된 사용자 모두 CRUD 전면 허용)
DROP POLICY IF EXISTS "Allow anon and auth on unified_certificates" ON unified_certificates;
CREATE POLICY "Allow anon and auth on unified_certificates" ON unified_certificates
  FOR ALL USING (true) WITH CHECK (true);
