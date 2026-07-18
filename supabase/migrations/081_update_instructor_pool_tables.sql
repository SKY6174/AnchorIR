-- 1. 기존 구형 이력 테이블 삭제 (새로운 변동 정보 이력 테이블로 통합)
DROP TABLE IF EXISTS public.instructor_payments CASCADE;
DROP TABLE IF EXISTS public.instructor_programs CASCADE;

-- 2. public.instructors (고정 정보) 테이블 생성 및 구조 조정
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 성별(gender) 컬럼 추가 (존재하지 않는 경우에만 생성)
ALTER TABLE public.instructors ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '미정';

-- 고정 정보에서 빠진 교내외여부, 인정등급 컬럼 정리 (존재할 경우에만 삭제)
ALTER TABLE public.instructors DROP COLUMN IF EXISTS is_internal;
ALTER TABLE public.instructors DROP COLUMN IF EXISTS rating_grade;

-- 3. 변동 정보 통합 테이블 (public.instructor_histories) 생성
CREATE TABLE IF NOT EXISTS public.instructor_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT 2026,                         -- 사업연도 (변동)
    department TEXT NOT NULL,                                  -- 소속 (변동)
    position TEXT NOT NULL,                                    -- 직급 (변동)
    is_internal BOOLEAN NOT NULL DEFAULT true,                 -- 교내/교외 여부 (변동)
    program_id TEXT NOT NULL,                                  -- 참여 프로그램 (변동)
    amount NUMERIC NOT NULL DEFAULT 0,                         -- 지급비용 (변동)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RLS 보안 설정 활성화
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_histories ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 수립 (조회 SELECT는 전체 개방하여 동기화 끊김 차단, 쓰기 ALL은 로그인된 관리자 제한)
DROP POLICY IF EXISTS "Allow authenticated full access to public.instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow public read access to public.instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow authenticated modifications to public.instructors" ON public.instructors;

CREATE POLICY "Allow public read access to public.instructors"
    ON public.instructors FOR SELECT USING (true);

CREATE POLICY "Allow authenticated modifications to public.instructors"
    ON public.instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access to public.instructor_histories" ON public.instructor_histories;
DROP POLICY IF EXISTS "Allow public read access to public.instructor_histories" ON public.instructor_histories;
DROP POLICY IF EXISTS "Allow authenticated modifications to public.instructor_histories" ON public.instructor_histories;

CREATE POLICY "Allow public read access to public.instructor_histories"
    ON public.instructor_histories FOR SELECT USING (true);

CREATE POLICY "Allow authenticated modifications to public.instructor_histories"
    ON public.instructor_histories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. 테스트용 시드(Seed) 데이터 주입
-- 관계 무결성을 위해 histories를 먼저 비우고 instructors를 초기화
DELETE FROM public.instructor_histories;
DELETE FROM public.instructors;

INSERT INTO public.instructors (name, gender, birth_date, bank_name, account_number) VALUES
('김철수', '남성', '1975-04-12', '국민은행', '110-123-456789'),
('이영희', '여성', '1982-11-23', '신한은행', '120-987-654321'),
('박민수', '남성', '1990-07-05', '하나은행', '150-111-222222')
ON CONFLICT DO NOTHING;

-- 변동 정보 이력 데이터 매핑 주입
INSERT INTO public.instructor_histories (instructor_id, year, department, position, is_internal, program_id, amount) VALUES
((SELECT id FROM public.instructors WHERE name = '김철수' LIMIT 1), 2026, '컴퓨터정보과', '교수', true, 'B2-S1T1-1', 350000),
((SELECT id FROM public.instructors WHERE name = '이영희' LIMIT 1), 2026, '간호학과', '전문강사', false, 'A1-S2T1-2', 500000),
((SELECT id FROM public.instructors WHERE name = '박민수' LIMIT 1), 2025, '기계공학과', '조교수', true, 'A1-S1T1-1', 400000)
ON CONFLICT DO NOTHING;
