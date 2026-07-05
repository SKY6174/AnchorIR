-- 036_add_created_by_and_refine_rls.sql
-- 1. 핵심 3대 테이블에 created_by UUID 컬럼 추가 및 기본값(auth.uid) 설정
ALTER TABLE procurement_equipment ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. 기존 테이블 내에 적재된 행들의 created_by가 NULL인 경우, 033번에서 가입된 기본 시드 계정(researcher)의 UUID를 기본 매핑하여 데이터 유실/오류 방지
DO $$
DECLARE
  default_uuid UUID;
BEGIN
  SELECT id INTO default_uuid FROM auth.users WHERE email = 'researcher@anchor.ac.kr' LIMIT 1;
  
  IF default_uuid IS NOT NULL THEN
    UPDATE procurement_equipment SET created_by = default_uuid WHERE created_by IS NULL;
    UPDATE procurement_env SET created_by = default_uuid WHERE created_by IS NULL;
    UPDATE procurement_services SET created_by = default_uuid WHERE created_by IS NULL;
  END IF;
END $$;

-- 3. 기존의 느슨했던 일괄 쓰기 RLS 정책 제거
DROP POLICY IF EXISTS "Restrict write on procurement_equipment to authenticated" ON procurement_equipment;
DROP POLICY IF EXISTS "Restrict write on procurement_env to authenticated" ON procurement_env;
DROP POLICY IF EXISTS "Restrict write on procurement_services to authenticated" ON procurement_services;

-- 4. 세부 작성자 한정 RLS 정책 새로 정의 (조회는 전체 허용, 추가는 로그인 회원, 수정/삭제는 본인 혹은 ADMIN 전용)

-- 1) procurement_equipment (기자재) 테이블 RLS 세분화
CREATE POLICY "Allow insert for authenticated users on equipment" 
    ON procurement_equipment FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow update/delete for creator or admin on equipment" 
    ON procurement_equipment FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    );

-- 2) procurement_env (환경개선) 테이블 RLS 세분화
CREATE POLICY "Allow insert for authenticated users on env" 
    ON procurement_env FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow update/delete for creator or admin on env" 
    ON procurement_env FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    );

-- 3) procurement_services (주요용역) 테이블 RLS 세분화
CREATE POLICY "Allow insert for authenticated users on services" 
    ON procurement_services FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow update/delete for creator or admin on services" 
    ON procurement_services FOR ALL 
    TO authenticated 
    USING (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    )
    WITH CHECK (
      auth.uid() = created_by 
      OR EXISTS (
        SELECT 1 FROM rise_users 
        WHERE rise_users.uuid = auth.uid() 
          AND rise_users.role_key = 'ADMIN'
      )
    );
