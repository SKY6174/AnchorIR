-- 14. 프로그램 예산 및 기획 변경 승인 요청 테이블
CREATE TABLE IF NOT EXISTS program_version_requests (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    unit_id TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    program_title TEXT NOT NULL,
    version_name TEXT NOT NULL,
    changes JSONB NOT NULL, -- {"before": {...}, "after": {...}} 구조로 기획 정보 통째 저장
    status TEXT NOT NULL DEFAULT '승인대기', -- '승인대기', '승인완료', '반려'
    requested_by TEXT NOT NULL, -- 신청 연구원 실명/이메일
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    approved_by TEXT, -- 승인자 실명
    approved_at TIMESTAMP WITH TIME ZONE
);

-- RLS 비활성화 (개발자 로컬 편의성 보장)
ALTER TABLE program_version_requests DISABLE ROW LEVEL SECURITY;
