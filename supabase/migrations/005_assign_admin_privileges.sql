-- 심현미 팀장(hmsim@uc.ac.kr)과 이규상 연구원(leegyu@uc.ac.kr)의 권한을 관리자(ADMIN)로 변경합니다.
UPDATE rise_users
SET role_key = 'ADMIN'
WHERE id IN ('hmsim@uc.ac.kr', 'leegyu@uc.ac.kr');
