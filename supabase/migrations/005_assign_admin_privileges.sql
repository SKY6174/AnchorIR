-- 심현미 팀장(hmsim@uc.ac.kr)의 권한을 관리자(ADMIN), 이규상 연구원(leegyu@uc.ac.kr)의 권한을 연구원(RESEARCH)으로 지정합니다.
UPDATE rise_users
SET role_key = 'ADMIN'
WHERE id = 'hmsim@uc.ac.kr';

UPDATE rise_users
SET role_key = 'RESEARCH'
WHERE id = 'leegyu@uc.ac.kr';
