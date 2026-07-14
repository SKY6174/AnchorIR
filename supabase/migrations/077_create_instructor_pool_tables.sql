-- 1. 교∙강사 인적사항 테이블 생성
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    birth_date TEXT NOT NULL, -- 암호화된 생년월일
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL, -- 암호화된 계좌번호
    rating_grade TEXT DEFAULT '일반',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 프로그램 참여 이력 테이블 생성
CREATE TABLE IF NOT EXISTS public.instructor_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT 2,
    unit_id TEXT NOT NULL,
    program_id TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 강사비 지출 이력 테이블 생성
CREATE TABLE IF NOT EXISTS public.instructor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL DEFAULT 0,
    program_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RLS 보안 설정 활성화
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_payments ENABLE ROW LEVEL SECURITY;

-- 5. 인증된 사용자(authenticated)에 한해 CRUD 모든 권한 부여하는 RLS 정책 수립
CREATE POLICY "Allow authenticated full access to instructors"
    ON public.instructors
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to instructor_programs"
    ON public.instructor_programs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to instructor_payments"
    ON public.instructor_payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. 테스트용 시드(Seed) 데이터 주입
-- 암호화 데이터는 프론트엔드 연동을 위해 임시로 평문 또는 가짜 암호화값 형태로 삽입하고, 화면에서 정상 렌더링되게 가이드합니다.
INSERT INTO public.instructors (name, is_internal, birth_date, bank_name, account_number, rating_grade) VALUES
('김철수', true, '1975-04-12', '국민은행', '110-123-456789', '전문'),
('이영희', false, '1982-11-23', '신한은행', '120-987-654321', '일반'),
('박민수', true, '1990-07-05', '하나은행', '150-111-222222', '우수')
ON CONFLICT DO NOTHING;

-- 임시 교강사 UUID를 조회하여 매핑하는 subquery 활용
INSERT INTO public.instructor_programs (instructor_id, year, unit_id, program_id, department) VALUES
((SELECT id FROM public.instructors LIMIT 1), 2, 'B2', 'B2-S1T1-1', '컴퓨터정보과'),
((SELECT id FROM public.instructors LIMIT 1 OFFSET 1), 2, 'A1', 'A1-S2T1-2', '간호학과')
ON CONFLICT DO NOTHING;

INSERT INTO public.instructor_payments (instructor_id, payment_date, amount, program_id, notes) VALUES
((SELECT id FROM public.instructors LIMIT 1), '2026-05-10', 350000, 'B2-S1T1-1', 'U-LIFE 평생교육 1차 특강료'),
((SELECT id FROM public.instructors LIMIT 1 OFFSET 1), '2026-06-15', 500000, 'A1-S2T1-2', '전문기술인재 양성 외부 전문가 심사비')
ON CONFLICT DO NOTHING;
