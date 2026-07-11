-- 064_update_all_member_passwords.sql
-- 송경영, 김현수, 심현미를 제외한 모든 구성원의 아이디(이메일)와 초기 비밀번호(휴대폰 번호 뒷자리 4자리 + '00')를 자동 생성하고 동기화합니다.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  m RECORD;
  raw_pw TEXT;
  phone_suffix TEXT;
  sha_pw TEXT;
  mapped_role_key TEXT;
  new_uid UUID;
BEGIN
  -- 송경영, 김현수, 심현미를 제외한 모든 구성원 순회
  FOR m IN 
    SELECT name, role, grade, dept, "phoneMobile", email 
    FROM rise_members 
    WHERE email NOT IN ('kysong@uc.ac.kr', 'hskim3@uc.ac.kr', 'hmsim@uc.ac.kr')
  LOOP
    -- 1. 휴대폰 번호에서 하이픈을 제거하고 마지막 4자리 추출 후 '00'을 붙여 6자리 초기 비밀번호 생성
    phone_suffix := right(replace(m."phoneMobile", '-', ''), 4);
    raw_pw := phone_suffix || '00';
    
    -- SHA-256 해시값 생성 (rise_users 테이블용)
    sha_pw := encode(digest(raw_pw, 'sha256'), 'hex');

    -- 2. 역할에 따른 role_key 매핑
    IF m.role = '센터장' THEN
      IF m.dept = 'ECC센터' THEN mapped_role_key := 'CENTER_ECC';
      ELSIF m.dept = 'ICC센터' THEN mapped_role_key := 'CENTER_ICC';
      ELSIF m.dept = 'RCC센터' THEN mapped_role_key := 'CENTER_RCC';
      ELSIF m.dept = '울산늘봄누리센터' THEN mapped_role_key := 'CENTER_NURI';
      ELSIF m.dept = '신산업특화센터' THEN mapped_role_key := 'CENTER_SPECIAL';
      ELSE mapped_role_key := 'CENTER_ECC';
      END IF;
    ELSIF m.role = '팀장교수' THEN
      mapped_role_key := 'TEAM_LEADER';
    ELSE
      mapped_role_key := 'RESEARCHER';
    END IF;

    -- 3. rise_users 테이블에 가입/갱신 (아이디는 이메일)
    INSERT INTO rise_users (id, pw, name, role_key, approved, email)
    VALUES (
      m.email,
      sha_pw,
      m.name || ' ' || m.role,
      mapped_role_key,
      true,
      m.email
    )
    ON CONFLICT (id) DO UPDATE
    SET pw = EXCLUDED.pw,
        name = EXCLUDED.name,
        role_key = EXCLUDED.role_key,
        approved = EXCLUDED.approved,
        email = EXCLUDED.email;

    -- 4. auth.users 테이블에 가입/비밀번호 갱신
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = m.email) THEN
      new_uid := gen_random_uuid();
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
      VALUES (
        new_uid,
        '00000000-0000-0000-0000-000000000000',
        m.email,
        crypt(raw_pw, gen_salt('bf', 10)),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', m.name || ' ' || m.role),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        ''
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(raw_pw, gen_salt('bf', 10)),
          email_confirmed_at = NOW(),
          raw_user_meta_data = jsonb_build_object('name', m.name || ' ' || m.role)
      WHERE email = m.email;
    END IF;

  END LOOP;
END $$;

-- 5. rise_users UUID 최종 동기화
UPDATE rise_users ru
SET uuid = au.id
FROM auth.users au
WHERE ru.email = au.email AND ru.uuid IS NULL;
