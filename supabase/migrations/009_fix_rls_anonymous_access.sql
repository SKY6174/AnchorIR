-- 1. 기존에 수립된 authenticated 한정 정책 제거
DROP POLICY IF EXISTS "Allow select for login verification" ON rise_users;
DROP POLICY IF EXISTS "Allow insert/update for auth users on rise_users" ON rise_users;
DROP POLICY IF EXISTS "Allow authenticated users on rise_members" ON rise_members;
DROP POLICY IF EXISTS "Allow authenticated users on projects_data" ON projects_data;
DROP POLICY IF EXISTS "Allow authenticated users on agreements" ON agreements;
DROP POLICY IF EXISTS "Allow authenticated users on procurement_env" ON procurement_env;
DROP POLICY IF EXISTS "Allow authenticated users on procurement_equipment" ON procurement_equipment;
DROP POLICY IF EXISTS "Allow authenticated users on procurement_services" ON procurement_services;
DROP POLICY IF EXISTS "Allow authenticated users on schedule_monthly" ON schedule_monthly;
DROP POLICY IF EXISTS "Allow authenticated users on schedule_events" ON schedule_events;
DROP POLICY IF EXISTS "Allow authenticated users on schedule_meetings" ON schedule_meetings;

-- 2. 중복 방지를 위한 신규 anon 연동 정책 드롭 구문 추가
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

-- 3. 익명(anon) 및 인증 사용자 전원에 대해 RLS 가동 하에 자유로운 읽기/쓰기/삭제 전권 허용 정책 정의
CREATE POLICY "Allow anon and auth on rise_users" ON rise_users
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on rise_members" ON rise_members
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on projects_data" ON projects_data
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on agreements" ON agreements
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on procurement_env" ON procurement_env
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on procurement_equipment" ON procurement_equipment
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on procurement_services" ON procurement_services
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on schedule_monthly" ON schedule_monthly
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on schedule_events" ON schedule_events
    TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and auth on schedule_meetings" ON schedule_meetings
    TO anon, authenticated USING (true) WITH CHECK (true);
