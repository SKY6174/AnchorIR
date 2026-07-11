-- 055_reset_hmsim_password.sql
-- 심현미 운영팀장(hmsim@uc.ac.kr)의 비밀번호를 원래의 '835900'으로 복원 초기화하고,
-- 가상 데모 계정 manager(manager@anchor.ac.kr)의 비밀번호를 'uc_anchor'로 재확정합니다.

-- 1. 심현미 운영팀장 실제 이메일 계정 (hmsim@uc.ac.kr) 비밀번호 복원 (835900)
-- pgcrypto 모듈의 crypt 함수를 사용해 bcrypt 해싱 처리
UPDATE auth.users
SET encrypted_password = crypt('835900', gen_salt('bf'))
WHERE email = 'hmsim@uc.ac.kr';

-- rise_users 테이블의 비밀번호를 '835900'의 SHA-256 해시값으로 업데이트
-- 해시값: 6f6825487e87d6a2ecdad6915216c842dea487868d51f62525457fa1faba3333
UPDATE rise_users
SET pw = '6f6825487e87d6a2ecdad6915216c842dea487868d51f62525457fa1faba3333'
WHERE id = 'hmsim@uc.ac.kr';

-- 2. 가상 데모 계정 (manager@anchor.ac.kr) 비밀번호 확정 (uc_anchor)
-- 'uc_anchor' 비밀번호를 bcrypt 해싱하여 저장
UPDATE auth.users
SET encrypted_password = crypt('uc_anchor', gen_salt('bf'))
WHERE email = 'manager@anchor.ac.kr';

-- rise_users 테이블의 비밀번호를 'uc_anchor'의 SHA-256 해시값으로 업데이트
-- 해시값: 4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd
UPDATE rise_users
SET pw = '4878f80e8ba9da88f81d5f10af4ee38b4c4fb452fd63e78cd02f5e88e2cbbacd'
WHERE id = 'manager' OR email = 'manager@anchor.ac.kr';
