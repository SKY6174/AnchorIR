-- 1. 파트너기관 정보 관리 테이블 생성
CREATE TABLE IF NOT EXISTS partner_institutions (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,                     -- 기관명 (유니크 제약조건을 설정하여 중복 생성 방지)
    category TEXT NOT NULL DEFAULT '산업체',        -- 대분류 (공공기관, 유관기관, 산업체, 대학, 지역사회)
    sub_category TEXT DEFAULT '',                  -- 세부분류 (시청, 구청, 대기업, 중견기업, 전문대학 등)
    location TEXT DEFAULT '울산',                  -- 지역
    sectors JSONB DEFAULT '[]'::jsonb,             -- 협력분야 (배열 형태를 보존하기 위해 JSONB 적용)
    contact_person TEXT DEFAULT '',                -- 담당자명
    contact_phone TEXT DEFAULT '',                 -- 연락처
    remarks TEXT DEFAULT '',                       -- 주요메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 개발 및 동기화 편의성을 확보하기 위해 RLS 비활성화
ALTER TABLE partner_institutions DISABLE ROW LEVEL SECURITY;
