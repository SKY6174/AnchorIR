-- 14. 프로그램 예산 및 기획 변경 승인 요청 테이블
CREATE TABLE IF NOT EXISTS program_version_requests (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    unit_id TEXT NOT NULL,
    program_id TEXT NOT NULL,
    program_title TEXT NOT NULL,
    version_name TEXT NOT NULL,
    changes JSONB NOT NULL, -- {"before": {...}, "after": {...}} 구조로 기획 정보 통째 저장
    status TEXT NOT NULL DEFAULT '승인대기', -- '승인대기', '승인완료', '반려'
    requested_by TEXT NOT NULL, -- 신청 연구원 실명/이메일
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    approved_by TEXT, -- 승인자 실명
    approved_at TIMESTAMP WITH TIME ZONE
);

-- RLS 정책 활성화 및 익명/인증 사용자 무제한 통과 허용 (기존 테이블 권한 패턴 준수)
ALTER TABLE program_version_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon and auth on program_version_requests" ON program_version_requests;
CREATE POLICY "Allow anon and auth on program_version_requests" ON program_version_requests
    TO anon, authenticated USING (true) WITH CHECK (true);

-- API 접근 및 시퀀스 번호 증감 권한 명시 부여
GRANT ALL ON TABLE program_version_requests TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE program_version_requests_id_seq TO anon, authenticated, service_role;
