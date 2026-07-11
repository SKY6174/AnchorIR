-- 054_update_user_passwords.sql
-- g_director(송경영 사업단장)와 manager(심현미 운영팀장) 계정 및 관련 구성원들의 비밀번호를 'uc_anchor'로 일괄 설정합니다.

DO $$
DECLARE
  new_uid UUID;
BEGIN
  -- 1. g_director 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'g_director@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'g_director@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"송경영 사업단장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
  END IF;

  -- 2. manager 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'manager@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"심현미 운영팀장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
  END IF;
END $$;

-- 3. 기존에 존재하는 실제 이메일 및 임시 계정들의 패스워드도 'uc_anchor'로 업데이트
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf'))
WHERE email IN (
  'director@anchor.ac.kr',
  'g_director@anchor.ac.kr',
  'kysong@uc.ac.kr',
  'manager@anchor.ac.kr',
  'hmsim@uc.ac.kr'
);

-- 4. rise_users 테이블에 g_director 와 manager 레코드가 없으면 생성
-- 'uc_anchor'의 SHA-256 해시값: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
INSERT INTO rise_users (id, pw, name, role_key, approved, email)
VALUES 
  ('g_director', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '송경영 사업단장', 'G_DIRECTOR', true, 'g_director@anchor.ac.kr'),
  ('manager', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '심현미 운영팀장', 'MANAGER', true, 'manager@anchor.ac.kr')
ON CONFLICT (id) DO UPDATE 
SET pw = EXCLUDED.pw, name = EXCLUDED.name, role_key = EXCLUDED.role_key, approved = EXCLUDED.approved, email = EXCLUDED.email;

-- 5. 기존에 존재하는 실제 계정들의 rise_users 비밀번호 동기화
UPDATE rise_users
SET pw = '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd'
WHERE id IN (
  'director',
  'kysong@uc.ac.kr',
  'hmsim@uc.ac.kr'
);

-- 6. rise_users의 UUID를 auth.users의 id값으로 매핑 싱크
UPDATE rise_users ru
SET uuid = au.id
FROM auth.users au
WHERE ru.email = au.email AND ru.uuid IS NULL;
