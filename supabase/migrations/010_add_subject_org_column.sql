-- 1. agreements 테이블에 subject_org 컬럼 신설 (IF NOT EXISTS로 멱등성 보장)
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS subject_org TEXT;

-- 2. RLS 정책 재적용 (anon 및 authenticated 전원 허용)
DROP POLICY IF EXISTS "Allow anon and auth on agreements" ON agreements;
CREATE POLICY "Allow anon and auth on agreements" ON agreements
    TO anon, authenticated USING (true) WITH CHECK (true);
