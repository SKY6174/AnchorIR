-- 037_allow_team_leader_edit_all.sql
-- 1. 기존의 ADMIN 전용 수정/삭제 RLS 정책 제거
DROP POLICY IF EXISTS "Allow update/delete for creator or admin on equipment" ON procurement_equipment;
DROP POLICY IF EXISTS "Allow update/delete for creator or admin on env" ON procurement_env;
DROP POLICY IF EXISTS "Allow update/delete for creator or admin on services" ON procurement_services;

-- 2. ADMIN 뿐만 아니라 TEAM_LEADER(운영팀장) 역할군도 타인의 데이터를 수정/삭제 가능하도록 완화된 최신 RLS 정책 정의

-- 1) procurement_equipment (기자재) 테이블 RLS 갱신
CREATE POLICY "Allow update/delete for creator or admin on equipment" 
    ON procurement_equipment FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    );

-- 2) procurement_env (환경개선) 테이블 RLS 갱신
CREATE POLICY "Allow update/delete for creator or admin on env" 
    ON procurement_env FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    );

-- 3) procurement_services (주요용역) 테이블 RLS 갱신
CREATE POLICY "Allow update/delete for creator or admin on services" 
    ON procurement_services FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key IN ('ADMIN', 'TEAM_LEADER')
      )
    );
