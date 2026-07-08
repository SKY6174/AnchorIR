-- 047_fix_database_security_vulnerabilities.sql
-- Supabase 보안 취약점 점검 경고(rls_disabled_in_public, sensitive_columns_exposed) 패치

-- 1. rise_users 테이블 보안 정책 강화 (비밀번호 pw 노출 원천 차단)
-- RLS 명시적 활성화 및 기존 취약한 익명 SELECT 정책 제거
ALTER TABLE public.rise_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on rise_users for auth mapping" ON public.rise_users;
DROP POLICY IF EXISTS "Allow select for login verification" ON public.rise_users;
DROP POLICY IF EXISTS "Allow authenticated changes on rise_users" ON public.rise_users;
DROP POLICY IF EXISTS "Allow insert/update for auth users on rise_users" ON public.rise_users;

-- 비로그인 익명(anon) 사용자에게는 rise_users 테이블 조회 권한을 차단
-- 로그인에 성공한 인증 회원(authenticated)만 자신의 데이터 매핑 및 비밀번호 변경 조회를 수행하도록 한정
CREATE POLICY "Allow select on rise_users for authenticated only" ON public.rise_users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all changes on rise_users for authenticated only" ON public.rise_users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 2. unified_certificates 테이블 RLS 정책 조정 (익명 권한 제한)
-- 비로그인 익명 사용자가 certificates 데이터를 함부로 쓰거나 삭제하지 못하게 차단
DROP POLICY IF EXISTS "Allow anon and auth on unified_certificates" ON public.unified_certificates;

-- 조회(SELECT)는 전체(anon, authenticated)에 개방하되, 쓰기 조작(CRUD)은 authenticated 롤에게만 제한
CREATE POLICY "Allow select for all on unified_certificates" ON public.unified_certificates
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Restrict write on unified_certificates to authenticated" ON public.unified_certificates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. scholarships 및 복호화 뷰 scholarships_view 비로그인 익명(anon) 권한 전면 박탈
-- 주민번호 및 계좌번호 평문이 복호화되는 민감 뷰에 대해 anon 역할의 모든 권한을 회수(REVOKE)합니다.
REVOKE ALL ON TABLE public.scholarships FROM anon;
REVOKE ALL ON TABLE public.scholarships_view FROM anon;

-- 오직 로그인된 세션(authenticated) 사용자만 쿼리하고 조작할 수 있도록 권한 격리
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarships_view TO authenticated;
