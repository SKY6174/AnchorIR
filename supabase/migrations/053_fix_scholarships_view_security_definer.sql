-- 053_fix_scholarships_view_security_definer.sql
-- pgp_sym_decrypt 복호화 뷰의 런타임 권한 거부(Permission Denied) 버그를 예방하기 위해,
-- 뷰 평가 시 정의자(postgres) 권한을 사용하도록 SECURITY DEFINER 함수 Wrapper 구조로 전면 혁신합니다.

-- 1. 기존 뷰 및 부착된 트리거 안전 제거 (CASCADE)
DROP VIEW IF EXISTS public.scholarships_view CASCADE;

-- 2. SECURITY DEFINER 권한의 장학금 조회용 함수 선언
CREATE OR REPLACE FUNCTION public.get_scholarships()
RETURNS TABLE (
  id bigint,
  year integer,
  dept text,
  major text,
  course text,
  student_id text,
  name text,
  resident_id text,
  grade text,
  enroll_status text,
  reg_status text,
  amount text,
  bank_name text,
  account_num text,
  account_holder text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.year,
    s.dept,
    s.major,
    s.course,
    s.student_id,
    s.name,
    pgp_sym_decrypt(s.resident_id, 'anchor_secure_key_2026') AS resident_id,
    s.grade,
    s.enroll_status,
    s.reg_status,
    s.amount,
    s.bank_name,
    pgp_sym_decrypt(s.account_num, 'anchor_secure_key_2026') AS account_num,
    s.account_holder,
    s.created_at,
    s.updated_at
  FROM public.scholarships s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 소유자를 postgres로 영구 이전
ALTER FUNCTION public.get_scholarships() OWNER TO postgres;

-- 3. 뷰 재정의 (구조 동일 유지하여 프론트엔드 호환성 100% 보장)
CREATE OR REPLACE VIEW public.scholarships_view AS
SELECT * FROM public.get_scholarships();

ALTER VIEW public.scholarships_view OWNER TO postgres;

-- 4. 뷰 갱신(INSERT/UPDATE/DELETE)을 위한 INSTEAD OF Trigger 및 함수 재부착
-- (044_add_approval_date_to_scholarships.sql 스펙 기준)
CREATE OR REPLACE FUNCTION public.scholarships_view_mutate()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.scholarships (
      year, dept, major, course, student_id, name,
      resident_id, grade, enroll_status, reg_status, amount, bank_name,
      account_num, account_holder, created_at, updated_at
    ) VALUES (
      NEW.year, NEW.dept, NEW.major, NEW.course, NEW.student_id, NEW.name,
      CASE WHEN NEW.resident_id IS NOT NULL AND NEW.resident_id <> '' THEN pgp_sym_encrypt(NEW.resident_id, 'anchor_secure_key_2026') ELSE NULL END,
      NEW.grade, NEW.enroll_status, NEW.reg_status, NEW.amount, NEW.bank_name,
      CASE WHEN NEW.account_num IS NOT NULL AND NEW.account_num <> '' THEN pgp_sym_encrypt(NEW.account_num, 'anchor_secure_key_2026') ELSE NULL END,
      NEW.account_holder, COALESCE(NEW.created_at, now()), COALESCE(NEW.updated_at, now())
    ) RETURNING id, created_at, updated_at INTO NEW.id, NEW.created_at, NEW.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.scholarships
    SET
      year = NEW.year,
      dept = NEW.dept,
      major = NEW.major,
      course = NEW.course,
      student_id = NEW.student_id,
      name = NEW.name,
      resident_id = CASE WHEN NEW.resident_id IS NOT NULL AND NEW.resident_id <> '' THEN pgp_sym_encrypt(NEW.resident_id, 'anchor_secure_key_2026') ELSE NULL END,
      grade = NEW.grade,
      enroll_status = NEW.enroll_status,
      reg_status = NEW.reg_status,
      amount = NEW.amount,
      bank_name = NEW.bank_name,
      account_num = CASE WHEN NEW.account_num IS NOT NULL AND NEW.account_num <> '' THEN pgp_sym_encrypt(NEW.account_num, 'anchor_secure_key_2026') ELSE NULL END,
      account_holder = NEW.account_holder,
      updated_at = now()
    WHERE id = OLD.id
    RETURNING updated_at INTO NEW.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.scholarships WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.scholarships_view_mutate() OWNER TO postgres;

-- 트리거 재부착
DROP TRIGGER IF EXISTS scholarships_view_mutate_trigger ON public.scholarships_view;
CREATE TRIGGER scholarships_view_mutate_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.scholarships_view
  FOR EACH ROW EXECUTE FUNCTION public.scholarships_view_mutate();

-- 5. 권한 최종 갱신
REVOKE ALL ON public.scholarships FROM anon;
REVOKE ALL ON public.scholarships_view FROM anon;

GRANT ALL PRIVILEGES ON public.scholarships TO authenticated;
GRANT ALL PRIVILEGES ON public.scholarships_view TO authenticated;
GRANT SELECT ON public.scholarships_view TO authenticated;
GRANT SELECT ON public.scholarships_view TO service_role;
