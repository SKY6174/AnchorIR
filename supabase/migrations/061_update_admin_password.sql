-- 061_update_admin_password.sql
-- admin 계정의 패스워드를 'uc_anchor'로 업데이트합니다.

-- 1. auth.users 테이블에서 admin@anchor.ac.kr의 비밀번호를 bcrypt 암호화하여 설정 ($2a$10$ 방식)
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf', 10))
WHERE email = 'admin@anchor.ac.kr';

-- 2. rise_users 테이블에서 admin의 비밀번호를 SHA-256 해시값으로 설정
-- 'uc_anchor' SHA-256 해시: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
UPDATE rise_users
SET pw = '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd'
WHERE id = 'admin';
