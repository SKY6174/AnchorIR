-- 044_add_approval_date_to_scholarships.sql
-- 장학금 관리 테이블에 승인일(결재일) 컬럼 추가

-- 1. Table 수정
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS approval_date text;

-- 2. 프론트엔드 연동을 위한 Updatable View 재생성
DROP VIEW IF EXISTS public.scholarships_view;
CREATE OR REPLACE VIEW public.scholarships_view AS
SELECT
  id,
  year,
  dept,
  major,
  course,
  student_id,
  name,
  pgp_sym_decrypt(resident_id, 'anchor_secure_key_2026') AS resident_id,
  grade,
  enroll_status,
  reg_status,
  amount,
  bank_name,
  pgp_sym_decrypt(account_num, 'anchor_secure_key_2026') AS account_num,
  account_holder,
  approval_date,
  created_at,
  updated_at
FROM public.scholarships;

-- 3. View 갱신을 위한 INSTEAD OF Trigger 함수
CREATE OR REPLACE FUNCTION public.scholarships_view_mutate()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.scholarships (
      year, dept, major, course, student_id, name, resident_id, grade,
      enroll_status, reg_status, amount, bank_name, account_num, account_holder, approval_date
    ) VALUES (
      NEW.year, NEW.dept, NEW.major, NEW.course, NEW.student_id, NEW.name,
      pgp_sym_encrypt(NEW.resident_id, 'anchor_secure_key_2026'),
      NEW.grade, NEW.enroll_status, NEW.reg_status, NEW.amount, NEW.bank_name,
      pgp_sym_encrypt(NEW.account_num, 'anchor_secure_key_2026'), NEW.account_holder, NEW.approval_date
    ) RETURNING id INTO NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.scholarships SET
      year = NEW.year,
      dept = NEW.dept,
      major = NEW.major,
      course = NEW.course,
      student_id = NEW.student_id,
      name = NEW.name,
      resident_id = pgp_sym_encrypt(NEW.resident_id, 'anchor_secure_key_2026'),
      grade = NEW.grade,
      enroll_status = NEW.enroll_status,
      reg_status = NEW.reg_status,
      amount = NEW.amount,
      bank_name = NEW.bank_name,
      account_num = pgp_sym_encrypt(NEW.account_num, 'anchor_secure_key_2026'),
      account_holder = NEW.account_holder,
      approval_date = NEW.approval_date,
      updated_at = timezone('utc'::text, now())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.scholarships WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS scholarships_view_mutate_trigger ON public.scholarships_view;
CREATE TRIGGER scholarships_view_mutate_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.scholarships_view
  FOR EACH ROW EXECUTE FUNCTION public.scholarships_view_mutate();
