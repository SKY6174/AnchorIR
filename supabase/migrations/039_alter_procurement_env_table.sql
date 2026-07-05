-- 039_alter_procurement_env_table.sql
-- procurement_env (환경개선) 테이블에 학과/부서 배정명, 5대 일정 일자(날짜) 및 AI 관련문서(기획/구매/결과) 컬럼 신규 추가 DDL

ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS dept_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS division_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_p DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_a DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_b DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_pr DATE;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS date_i DATE;

-- AI 문서 분석 및 첨부파일 연동 관련 컬럼 추가
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_plan TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_purchase TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_bid TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_plan_file_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_purchase_file_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_bid_file_name TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_plan_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_purchase_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_bid_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_plan_file_url TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_purchase_file_url TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS doc_bid_file_url TEXT DEFAULT '';
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS ai_proposal_data JSONB;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS ai_purchase_data JSONB;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS ai_bid_data JSONB;
ALTER TABLE procurement_env ADD COLUMN IF NOT EXISTS related_docs TEXT DEFAULT '';
