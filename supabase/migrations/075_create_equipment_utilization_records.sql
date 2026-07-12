-- /Users/thomas/Documents/AnchorIR/supabase/migrations/075_create_equipment_utilization_records.sql
-- 기자재 학기별 활용 실적을 기록 및 관리하기 위한 테이블 정의

CREATE TABLE IF NOT EXISTS public.equipment_utilization_records (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES public.equipment_assets(id) ON DELETE CASCADE,
    semester VARCHAR(50) NOT NULL,
    usage_details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.equipment_utilization_records ENABLE ROW LEVEL SECURITY;

-- 익명/인증 유저 모두의 조회 권한 허용
CREATE POLICY "Allow read access to everyone" 
ON public.equipment_utilization_records FOR SELECT USING (true);

-- 로그인한 사용자(authenticated)의 CRUD 제어 정책 설정
CREATE POLICY "Allow all access to authenticated users" 
ON public.equipment_utilization_records FOR ALL TO authenticated USING (true);
