-- 051_reset_member_passwords.sql
-- 송경영 사업단장을 제외한 모든 구성원의 Supabase Auth 비밀번호를 '휴대폰 뒷자리 4자리 + 00'의 해시로 일괄 동기화 및 재설정합니다.
-- pgcrypto 모듈의 crypt 함수를 사용하여 데이터베이스 내에서 실시간 bcrypt 해싱을 처리합니다.

UPDATE auth.users au
SET encrypted_password = crypt(RIGHT(REGEXP_REPLACE(rm."phoneMobile", '[^0-9]', '', 'g'), 4) || '00', gen_salt('bf'))
FROM rise_members rm
WHERE au.email = rm.email
  AND au.email != 'kysong@uc.ac.kr';
