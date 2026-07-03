-- 1. schedule_monthly 테이블에 할일 유무 및 완료 상태 플래그 컬럼 신설
ALTER TABLE schedule_monthly ADD COLUMN IF NOT EXISTS is_task BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE schedule_monthly ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. RLS 보안 규칙 재수립 (anon 및 authenticated 접근 허용 보장)
DROP POLICY IF EXISTS "Allow anon and auth on schedule_monthly" ON schedule_monthly;
CREATE POLICY "Allow anon and auth on schedule_monthly" ON schedule_monthly
    TO anon, authenticated USING (true) WITH CHECK (true);
