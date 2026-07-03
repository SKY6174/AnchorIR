-- 1. 기존 모든 테이블에 대한 행 수준 보안(RLS) 일제히 활성화
ALTER TABLE rise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rise_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_env ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_meetings ENABLE ROW LEVEL SECURITY;

-- 2. 기존에 정의되었을 수 있는 정책 중복 에러를 방지하기 위해 드롭 구문 추가
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

-- 3. rise_users 테이블 보안 정책 수립
-- 비로그인(anon) 상태에서도 로그인 쿼리(계정 일치 검사)가 동작할 수 있도록 SELECT는 anon 및 authenticated 전원 허용
CREATE POLICY "Allow select for login verification" ON rise_users
    FOR SELECT TO anon, authenticated USING (true);

-- 데이터 조작(INSERT, UPDATE, DELETE)은 로그인을 마친 회원(authenticated) 또는 admin 롤에게만 전권 허용
CREATE POLICY "Allow insert/update for auth users on rise_users" ON rise_users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. rise_members 및 대시보드 지표/일정 테이블 보안 정책 수립
-- 오직 로그인 세션을 가진 회원(authenticated)에게만 전권(ALL) 허용하여 비로그인 상태의 해킹 공격 차단
CREATE POLICY "Allow authenticated users on rise_members" ON rise_members
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on projects_data" ON projects_data
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on agreements" ON agreements
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on procurement_env" ON procurement_env
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on procurement_equipment" ON procurement_equipment
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on procurement_services" ON procurement_services
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on schedule_monthly" ON schedule_monthly
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on schedule_events" ON schedule_events
    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users on schedule_meetings" ON schedule_meetings
    TO authenticated USING (true) WITH CHECK (true);
