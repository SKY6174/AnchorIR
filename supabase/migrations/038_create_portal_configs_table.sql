-- 038_create_portal_configs_table.sql
-- 1. 포털 통합 설정을 저장하기 위한 portal_configs 테이블 생성
CREATE TABLE IF NOT EXISTS portal_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 기본 메뉴 노출 설정을 시드(Seed) 데이터로 삽입
INSERT INTO portal_configs (key, value)
VALUES ('menu_visibility', '{
  "dashboard": true,
  "progress": true,
  "progress_status": true,
  "major_programs": true,
  "satisfaction": true,
  "budget": true,
  "settlement": true,
  "execution": true,
  "kpis": true,
  "kpi_status": true,
  "kpi_self": true,
  "kpi_focus": true,
  "agreements": true,
  "certificates": true,
  "awards": true,
  "procurement": true,
  "env_improvement": true,
  "equip_purchase": true,
  "service_procure": true,
  "schedules": true,
  "schedules_monthly": true,
  "schedules_major": true,
  "schedules_meetings": true,
  "wiki": true,
  "management": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. 테이블에 대한 RLS 정책 수립 (조회는 인증된 사용자 전원 가능, 수정은 오직 ADMIN만 가능)
ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;

-- 1) 조회 정책 (인증된 로그인 사용자 전원 가능)
CREATE POLICY "Allow read portal_configs for authenticated"
    ON portal_configs FOR SELECT
    TO authenticated
    USING (true);

-- 2) 수정/저장 정책 (오직 ADMIN 권한 소유자만 가능)
CREATE POLICY "Allow write portal_configs for admin only"
    ON portal_configs FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM rise_users
        WHERE rise_users.uuid = auth.uid()
          AND rise_users.role_key = 'ADMIN'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM rise_users
        WHERE rise_users.uuid = auth.uid()
          AND rise_users.role_key = 'ADMIN'
      )
    );
