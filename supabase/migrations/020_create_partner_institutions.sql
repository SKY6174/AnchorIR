-- 020_create_partner_institutions.sql
-- 파트너기관 정보 관리 테이블 신설 및 RLS 보안 정책 정의

CREATE TABLE IF NOT EXISTS public.partner_institutions (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- '공공기관', '유관기관', '산업체', '대학', '지역사회'
    sub_category TEXT,      -- '대기업', '중견기업', '중소기업', '스타트업', '일반대학', '전문대학', '협의체' 등
    location TEXT NOT NULL,  -- '울산', '부산', '제주' 등
    sectors TEXT[] DEFAULT '{}', -- 협력분야 (다중선택 배열)
    contact_person TEXT,     -- 담당자
    contact_phone TEXT,      -- 연락처
    remarks TEXT,            -- 메모 및 협력 성과
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.partner_institutions ENABLE ROW LEVEL SECURITY;

-- 익명(anon) 및 인증 사용자 전원에 대해 CRUD 전면 허용 정책
DROP POLICY IF EXISTS "Allow anon and auth on partner_institutions" ON public.partner_institutions;
CREATE POLICY "Allow anon and auth on partner_institutions" ON public.partner_institutions
    TO anon, authenticated USING (true) WITH CHECK (true);
