-- 069_final_password_suffix_reset.sql
-- 구성원 초기 비밀번호 정책을 최종 확정된 '휴대전화 뒷자리 4자리 + 00' (6자리 숫자) 구조로 완전히 재동기화 리셋을 수행합니다.

CREATE OR REPLACE FUNCTION public.reset_all_member_passwords_v4()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  m RECORD;
  raw_pw TEXT;
  phone_clean TEXT;
  phone_with_prefix TEXT;
  sha_pw TEXT;
  mapped_role_key TEXT;
  new_uid UUID;
  updated_count INT := 0;
BEGIN
  -- 송경영, 김현수, 심현미를 제외하고 이메일과 전화번호가 모두 기재된 구성원 순회
  FOR m IN 
    SELECT name, role, grade, dept, "phoneMobile", email 
    FROM rise_members 
    WHERE email NOT IN ('kysong@uc.ac.kr', 'hskim3@uc.ac.kr', 'hmsim@uc.ac.kr')
      AND email IS NOT NULL AND email != ''
      AND "phoneMobile" IS NOT NULL AND "phoneMobile" != ''
  LOOP
    -- 1. 휴대폰 번호에서 하이픈 및 공백을 제거하고 가장 뒷자리 4자리 뒤에 '00'을 붙여 6자리 초기 비밀번호 생성
    phone_clean := replace(replace(m."phoneMobile", '-', ''), ' ', '');
    raw_pw := right(phone_clean, 4) || '00';

    -- Supabase Auth에 저장될 폰번호 형식 지정 (하이픈 없는 순수 기호 포맷)
    phone_with_prefix := phone_clean;

    -- SHA-256 해시 생성 (rise_users 저장용)
    BEGIN
      sha_pw := encode(extensions.digest(raw_pw, 'sha256'), 'hex');
    EXCEPTION WHEN OTHERS THEN
      sha_pw := encode(digest(raw_pw, 'sha256'), 'hex');
    END;

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
    INSERT INTO rise_users (id, pw, name, role_key, approved, email, uuid)
    VALUES (
      m.email,
      sha_pw,
      m.name || ' ' || m.role,
      mapped_role_key,
      true,
      m.email,
      COALESCE((SELECT id FROM auth.users WHERE email = m.email), gen_random_uuid())
    )
    ON CONFLICT (id) DO UPDATE
    SET pw = EXCLUDED.pw,
        name = EXCLUDED.name,
        role_key = EXCLUDED.role_key,
        approved = EXCLUDED.approved,
        email = EXCLUDED.email;

    -- 4. auth.users 테이블에 가입/비밀번호 및 phone 정보 갱신
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = m.email) THEN
      new_uid := (SELECT uuid FROM rise_users WHERE id = m.email);
      IF new_uid IS NULL THEN
        new_uid := gen_random_uuid();
      END IF;
      
      DECLARE
        enc_pass TEXT;
      BEGIN
        enc_pass := extensions.crypt(raw_pw, extensions.gen_salt('bf', 10));
      EXCEPTION WHEN OTHERS THEN
        enc_pass := crypt(raw_pw, gen_salt('bf', 10));
      END;

      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        role, aud, confirmation_token, phone, phone_confirmed_at
      )
      VALUES (
        new_uid,
        '00000000-0000-0000-0000-000000000000',
        m.email,
        enc_pass,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', m.name || ' ' || m.role),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        phone_with_prefix,
        NOW()
      );
    ELSE
      DECLARE
        enc_pass TEXT;
      BEGIN
        enc_pass := extensions.crypt(raw_pw, extensions.gen_salt('bf', 10));
      EXCEPTION WHEN OTHERS THEN
        enc_pass := crypt(raw_pw, gen_salt('bf', 10));
      END;

      UPDATE auth.users
      SET encrypted_password = enc_pass,
          phone = phone_with_prefix,
          phone_confirmed_at = NOW(),
          email_confirmed_at = NOW(),
          raw_user_meta_data = jsonb_build_object('name', m.name || ' ' || m.role),
          updated_at = NOW()
      WHERE email = m.email;
    END IF;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN 'Successfully reset ' || updated_count || ' auth users to 6-digit suffix passwords.';
END $$;

-- 6자리 비밀번호 동기화 함수 실행 (즉시 동기화 적재)
SELECT public.reset_all_member_passwords_v4();
