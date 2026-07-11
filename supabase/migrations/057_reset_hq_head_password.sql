-- 057_reset_hq_head_password.sql
-- hq_head(총괄본부장) 계정의 패스워드를 'uc_anchor'로 설정하고,
-- hskim3@uc.ac.kr(김현수 총괄본부장 실제 계정)의 패스워드는 '796300'으로 업데이트합니다.

DO $$
DECLARE
  new_uid UUID;
BEGIN
  -- 1. hq_head@anchor.ac.kr 계정이 auth.users에 없으면 신규 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hq_head@anchor.ac.kr') THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'hq_head@anchor.ac.kr',
      crypt('uc_anchor', gen_salt('bf')),
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

-- 2. auth.users 테이블의 비밀번호 업데이트
-- hq_head@anchor.ac.kr -> uc_anchor
-- hskim3@uc.ac.kr -> 796300
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf'))
WHERE email = 'hq_head@anchor.ac.kr';

UPDATE auth.users
SET encrypted_password = crypt('796300', gen_salt('bf'))
WHERE email = 'hskim3@uc.ac.kr';

-- 3. rise_users 테이블에 hq_head 레코드 없으면 생성 및 동기화
-- 'uc_anchor' SHA-256 해시: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
INSERT INTO rise_users (id, pw, name, role_key, approved, email)
VALUES ('hq_head', '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd', '김현수 총괄본부장', 'HQ_HEAD', true, 'hq_head@anchor.ac.kr')
ON CONFLICT (id) DO UPDATE 
SET pw = EXCLUDED.pw, name = EXCLUDED.name, role_key = EXCLUDED.role_key, approved = EXCLUDED.approved, email = EXCLUDED.email;

-- 4. hskim3@uc.ac.kr 실제 계정의 rise_users 비밀번호 동기화 (796300의 SHA-256 해시)
UPDATE rise_users
SET pw = '2d872d140f616259aad89b2cf49a33134363a50ec3316d6262d534a641b91409'
WHERE id = 'hskim3@uc.ac.kr';

-- 5. rise_users UUID 매핑 동기화
UPDATE rise_users ru
SET uuid = au.id
FROM auth.users au
WHERE ru.email = au.email AND ru.uuid IS NULL;
