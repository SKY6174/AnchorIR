-- 089_update_hong_kwang_pyo_email.sql
-- 홍광표 센터장의 이메일 주소를 gphong@uc.ac.kr에서 kphong@uc.ac.kr로 일괄 수정합니다.

-- 1. rise_members 테이블 업데이트 (구성원 주소록 정보)
UPDATE rise_members
SET email = 'kphong@uc.ac.kr'
WHERE email = 'gphong@uc.ac.kr';

-- 2. rise_users 테이블 업데이트 (로그인 정보)
-- id 필드가 기본키(PK)이므로, id와 email을 모두 변경합니다.
UPDATE rise_users
SET id = 'kphong@uc.ac.kr',
    email = 'kphong@uc.ac.kr'
WHERE id = 'gphong@uc.ac.kr';

-- 3. Supabase Auth (auth.users) 테이블 업데이트
UPDATE auth.users
SET email = 'kphong@uc.ac.kr'
WHERE email = 'gphong@uc.ac.kr';
