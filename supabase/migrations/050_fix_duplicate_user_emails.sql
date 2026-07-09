-- 050_fix_duplicate_user_emails.sql
-- 이미 DB에 잘못 시딩되어 들어간 rise_users 테이블의 오염된 이메일 주소(*@uc.ac.kr@anchor.ac.kr)를 정상 이메일로 원복합니다.
UPDATE rise_users 
SET email = REPLACE(email, '@anchor.ac.kr', '') 
WHERE email LIKE '%@uc.ac.kr@anchor.ac.kr';

-- 혹시 id 컬럼과 email 컬럼이 불일치하는 경우, id가 이메일 주소 전체 형식일 때 email도 id와 동일하게 맞춤 보정합니다.
UPDATE rise_users
SET email = id
WHERE id LIKE '%@uc.ac.kr' AND email != id;
