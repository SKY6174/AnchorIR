-- 062_update_user_roles.sql
-- kysong@uc.ac.kr 및 leegyu@uc.ac.kr의 역할키(role_key)를 각각 'G_DIRECTOR', 'RESEARCHER'로 보정합니다.

-- 1. kysong@uc.ac.kr (송경영 사업단장) 역할키 변경: DIRECTOR -> G_DIRECTOR
UPDATE rise_users
SET role_key = 'G_DIRECTOR'
WHERE id = 'kysong@uc.ac.kr';

-- 2. leegyu@uc.ac.kr (이규상 연구원) 역할키 변경: RESEARCH -> RESEARCHER
UPDATE rise_users
SET role_key = 'RESEARCHER'
WHERE id = 'leegyu@uc.ac.kr';
