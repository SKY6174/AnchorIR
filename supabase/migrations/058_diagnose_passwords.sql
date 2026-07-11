-- 058_diagnose_passwords.sql
-- auth.users의 encrypted_password를 rise_users 테이블의 pw 컬럼에 임시 복사하여 해시값을 진단합니다.

UPDATE rise_users ru
SET pw = au.encrypted_password
FROM auth.users au
WHERE ru.email = au.email;
