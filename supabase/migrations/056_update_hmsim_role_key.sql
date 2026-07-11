-- 056_update_hmsim_role_key.sql
-- 심현미 운영팀장(hmsim@uc.ac.kr) 계정의 서비스 권한(role_key)을 'MANAGER'로 업데이트합니다.
-- 이를 통해 hmsim 및 hmsim@uc.ac.kr 아이디로 로그인 시 'MANAGER' 역할을 올바르게 획득하도록 보장합니다.

UPDATE rise_users
SET role_key = 'MANAGER'
WHERE id = 'hmsim@uc.ac.kr';
