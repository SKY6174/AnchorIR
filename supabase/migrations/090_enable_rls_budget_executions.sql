-- ==========================================
-- 090_enable_rls_budget_executions.sql
-- ==========================================
-- Supabase Security Advisor RLS Disabled Warning 조치
-- public.budget_executions 테이블에 Row Level Security (RLS) 활성화 및 접근 정책 수립

-- 1. public.budget_executions 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.budget_executions ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 중복 방지 정리
DROP POLICY IF EXISTS "Allow all for authenticated users on budget_executions" ON public.budget_executions;
DROP POLICY IF EXISTS "Allow anon read for budget_executions" ON public.budget_executions;

-- 3. 접근 정책 수립
-- 3-1) 인증된 사용자(authenticated)에게 모든 권한(SELECT, INSERT, UPDATE, DELETE) 부여
CREATE POLICY "Allow all for authenticated users on budget_executions"
ON public.budget_executions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3-2) 익명 사용자(anon) 읽기 권한 허용 (필요시 또는 대시보드 조회용)
CREATE POLICY "Allow anon read for budget_executions"
ON public.budget_executions
FOR SELECT
TO anon
USING (true);
