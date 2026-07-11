-- 060_pre_create_demo_users.sql
-- checksum 불일치로 배포가 마비되었던 문제를 해결하기 위해,
-- 054에 넣으려 했던 수동 계정 생성(pre-creation) 로직을 이 마이그레이션으로 격리 이관합니다.

DO $$
DECLARE
  new_uid UUID;
BEGIN
  -- 1. g_director@anchor.ac.kr 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'g_director@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'g_director@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf', 10)), -- $2a$10$ Bcrypt 암호화
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

  -- 2. manager@anchor.ac.kr 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'manager@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf', 10)), -- $2a$10$ Bcrypt 암호화
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

  -- 3. hq_head@anchor.ac.kr 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hq_head@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'hq_head@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf', 10)), -- $2a$10$ Bcrypt 암호화
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"김현수 총괄본부장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
  END IF;
END $$;

-- 4. 모든 관련 계정의 이메일 인증 활성화 및 비밀번호 재확정 (안정적인 $2a$10$ bcrypt 암호화 방식 명시)
UPDATE auth.users
SET email_confirmed_at = NOW(),
    encrypted_password = crypt('uc_anchor', gen_salt('bf', 10))
WHERE email IN (
  'director@anchor.ac.kr',
  'g_director@anchor.ac.kr',
  'manager@anchor.ac.kr',
  'hq_head@anchor.ac.kr'
);

-- 5. rise_users 테이블에 가상 데모 계정들(g_director, manager, hq_head)이 존재하지 않으면 추가 및 동기화
-- 'uc_anchor' SHA-256 해시값: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
INSERT INTO rise_users (id, pw, name, role_key, approved, email)
VALUES 
  ('g_director', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '송경영 사업단장', 'G_DIRECTOR', true, 'g_director@anchor.ac.kr'),
  ('manager', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '심현미 운영팀장', 'MANAGER', true, 'manager@anchor.ac.kr'),
  ('hq_head', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '김현수 총괄본부장', 'HQ_HEAD', true, 'hq_head@anchor.ac.kr')
ON CONFLICT (id) DO UPDATE 
SET pw = EXCLUDED.pw, name = EXCLUDED.name, role_key = EXCLUDED.role_key, approved = EXCLUDED.approved, email = EXCLUDED.email;

-- 6. rise_users UUID 최종 동기화
UPDATE rise_users ru
SET uuid = au.id
FROM auth.users au
WHERE ru.email = au.email AND ru.uuid IS NULL;
