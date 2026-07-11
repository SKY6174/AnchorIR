-- 063_clear_demo_names.sql
-- g_director, manager, hq_head 데모 계정들의 실명 정보를 DB 상에서 공백으로 비워두어 개인정보 노출을 전면 방지합니다.

UPDATE rise_users
SET name = ''
WHERE id IN ('g_director', 'manager', 'hq_head');
