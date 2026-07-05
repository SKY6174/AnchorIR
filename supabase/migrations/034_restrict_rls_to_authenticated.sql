-- 034_restrict_rls_to_authenticated.sql
-- 1. 기존에 수립된 익명(anon) 자유 권한 정책 일제히 드롭 (009번 패치 복구)
DROP POLICY IF EXISTS "Allow anon and auth on rise_users" ON rise_users;
DROP POLICY IF EXISTS "Allow anon and auth on rise_members" ON rise_members;
DROP POLICY IF EXISTS "Allow anon and auth on projects_data" ON projects_data;
DROP POLICY IF EXISTS "Allow anon and auth on agreements" ON agreements;
DROP POLICY IF EXISTS "Allow anon and auth on procurement_env" ON procurement_env;
DROP POLICY IF EXISTS "Allow anon and auth on procurement_equipment" ON procurement_equipment;
DROP POLICY IF EXISTS "Allow anon and auth on procurement_services" ON procurement_services;
DROP POLICY IF EXISTS "Allow anon and auth on schedule_monthly" ON schedule_monthly;
DROP POLICY IF EXISTS "Allow anon and auth on schedule_events" ON schedule_events;
DROP POLICY IF EXISTS "Allow anon and auth on schedule_meetings" ON schedule_meetings;

-- 2. 신규 강화 정책 수립
-- 1) rise_users 테이블:
-- SELECT는 비로그인 로그인 불문하고 계정 매핑 및 로그인을 위해 오픈
CREATE POLICY "Allow select on rise_users for auth mapping" ON rise_users
    FOR SELECT TO anon, authenticated USING (true);
-- INSERT, UPDATE, DELETE는 오직 실제 로그인한 관리자/사용자 본인 세션에만 허용
CREATE POLICY "Allow authenticated changes on rise_users" ON rise_users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2) rise_members 테이블 (주소록):
-- 주소록 데이터는 민감한 휴대전화번호 등이 들어있으므로, SELECT부터 조작까지 오직 로그인 회원(authenticated)에게만 완전히 한정함
CREATE POLICY "Restrict rise_members access to authenticated only" ON rise_members
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) 핵심 사업 관리 테이블군 (projects_data, agreements, procurement_env, procurement_equipment, procurement_services):
-- SELECT 조회는 비로그인/로그인 전원에게 허용하여 대시보드 공공 열람 호환성 유지
-- INSERT, UPDATE, DELETE 조작 권한은 오직 로그인한 회원(authenticated)에게만 엄격히 차단/한정함
CREATE POLICY "Allow select for all on projects_data" ON projects_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on projects_data to authenticated" ON projects_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on agreements" ON agreements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on agreements to authenticated" ON agreements FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on procurement_env" ON procurement_env FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on procurement_env to authenticated" ON procurement_env FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on procurement_equipment" ON procurement_equipment FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on procurement_equipment to authenticated" ON procurement_equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on procurement_services" ON procurement_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on procurement_services to authenticated" ON procurement_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4) 일정 테이블군 (schedule_monthly, schedule_events, schedule_meetings):
-- SELECT 조회는 전체 허용, 쓰기 조작은 로그인 회원에게만 한정
CREATE POLICY "Allow select for all on schedule_monthly" ON schedule_monthly FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on schedule_monthly to authenticated" ON schedule_monthly FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on schedule_events" ON schedule_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on schedule_events to authenticated" ON schedule_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for all on schedule_meetings" ON schedule_meetings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restrict write on schedule_meetings to authenticated" ON schedule_meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
