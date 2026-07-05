-- 039_alter_procurement_env_table.sql
-- procurement_env (환경개선) 테이블에 학과/부서 배정명 및 5대 일정 일자(날짜) 컬럼 신규 추가 DDL

ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS dept_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS division_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_p DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_a DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_b DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_pr DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_i DATE;
