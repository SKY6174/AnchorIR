-- 059_confirm_all_emails.sql
-- 모든 데모 및 관리자 계정의 이메일 인증 상태(email_confirmed_at)를 NOW()로 강제 업데이트하여 
-- 미인증 계정 상태로 인한 로그인 실패를 우회하고, 비밀번호를 'uc_anchor'로 재조정합니다.

-- 1. 모든 관련 계정의 이메일 인증 확인 시간 강제 업데이트
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
  'director@anchor.ac.kr',
  'g_director@anchor.ac.kr',
  'kysong@uc.ac.kr',
  'manager@anchor.ac.kr',
  'hmsim@uc.ac.kr',
  'hq_head@anchor.ac.kr',
  'hskim3@uc.ac.kr'
);

-- 2. 데모 가상 계정들의 비밀번호를 'uc_anchor'의 bcrypt 암호화 해시로 재조정
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf'))
WHERE email IN (
  'director@anchor.ac.kr',
  'g_director@anchor.ac.kr',
  'manager@anchor.ac.kr',
  'hq_head@anchor.ac.kr'
);
