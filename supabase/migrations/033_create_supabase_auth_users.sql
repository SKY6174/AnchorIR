-- 033_create_supabase_auth_users.sql
-- 1.기존 rise_users 테이블에 supabase auth.users와 연동하기 위한 uuid 및 email 컬럼 추가
ALTER TABLE rise_users ADD COLUMN IF NOT EXISTS uuid UUID UNIQUE;
ALTER TABLE rise_users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2.기존 사용자 데이터에 이메일 자동 매핑 (아이디@anchor.ac.kr 형식)
UPDATE rise_users SET email = id || '@anchor.ac.kr' WHERE email IS NULL;

-- 3.Supabase auth.users 테이블에 기본 시드 사용자(director, hq_head, ecc_head, special_head, manager, researcher) 적재
-- 비밀번호는 '1234'로 설정합니다. (Bcrypt 해시: $2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.)
-- auth.users에 계정이 존재하지 않는 경우에만 삽입되도록 구현하여 중복 오류 방지
DO $$
DECLARE
  user_rec RECORD;
  new_uid UUID;
BEGIN
  -- 1) director 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'director@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'director@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.', -- '1234'
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"송경영 사업단장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'director';
  END IF;

  -- 2) hq_head 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hq_head@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'hq_head@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"김현수 총괄본부장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'hq_head';
  END IF;

  -- 3) ecc_head 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ecc_head@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'ecc_head@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"이동은 ECC센터장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'ecc_head';
  END IF;

  -- 4) special_head 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'special_head@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'special_head@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"홍진숙 신산업특화센터장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'special_head';
  END IF;

  -- 5) manager 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'manager@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"심현미 운영팀장"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'manager';
  END IF;

  -- 6) researcher 계정 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'researcher@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'researcher@anchor.ac.kr',
      '$2a$10$wW5g70c6qS.Fm8H8F19JFe68Q3c3Vv5n2gH3r7o0y0L8G9I2U2q3.',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"이은주 선임연구원"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    UPDATE rise_users SET uuid = new_uid WHERE id = 'researcher';
  END IF;

END $$;

-- 4.기존 rise_users의 외래키 연동
-- 만약 이미 uuid가 할당된 사용자가 있다면, auth.users의 id 값을 역으로 대입하여 매핑해줍니다.
UPDATE rise_users ru
SET uuid = au.id
FROM auth.users au
WHERE ru.email = au.email AND ru.uuid IS NULL;
