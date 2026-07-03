-- 1. certificates (이수증) 테이블 신설
CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    cert_no TEXT NOT NULL,
    recipient_dept TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    issuer TEXT NOT NULL,
    file_name TEXT,
    file_data TEXT, -- Base64 원본 텍스트
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. RLS 활성화
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 3. 정책 설정 (익명 및 인증된 사용자 모두 CRUD 전면 허용)
DROP POLICY IF EXISTS "Allow anon and auth on certificates" ON certificates;
CREATE POLICY "Allow anon and auth on certificates" ON certificates
  FOR ALL USING (true) WITH CHECK (true);
