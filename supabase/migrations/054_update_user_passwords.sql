-- 054_update_user_passwords.sql
-- g_director(송경영 사업단장)와 manager(심현미 운영팀장) 계정의 패스워드를 'uc_anchor'로 업데이트하는 마이그레이션 스크립트입니다.

-- 1. Supabase Auth (auth.users) 테이블의 비밀번호를 bcrypt 암호화하여 업데이트
-- pgcrypto 모듈의 crypt 함수를 사용하며, 'uc_anchor' 비밀번호를 암호화하여 직접 반영합니다.
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf'))
WHERE email IN (
  'g_director@anchor.ac.kr',
  'kysong@uc.ac.kr',
  'manager@anchor.ac.kr',
  'hmsim@uc.ac.kr'
);

-- 2. 서비스 사용자 정보 (rise_users) 테이블의 비밀번호를 SHA-256 해시값으로 업데이트
-- 'uc_anchor'의 SHA-256 해시: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
UPDATE rise_users
SET pw = '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd'
WHERE id IN (
  'director',
  'kysong@uc.ac.kr',
  'manager',
  'hmsim@uc.ac.kr'
) OR email IN (
  'g_director@anchor.ac.kr',
  'kysong@uc.ac.kr',
  'manager@anchor.ac.kr',
  'hmsim@uc.ac.kr'
);
