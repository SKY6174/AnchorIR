-- 040_alter_procurement_services_table.sql
-- procurement_services (주요용역) 테이블에 행정 절차 고도화 및 기획/구매/결과 3종 관련문서 추가용 DDL

ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'A1';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS program_id TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS program_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS dept_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS division_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '1234';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS related_docs TEXT DEFAULT '';

-- 7대 행정 절차 날짜 컬럼 추가
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_pp DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_rfo DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_b DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_es DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_c DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_e DATE;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS date_i DATE;

-- AI 기획/구매/결과 관련문서 컬럼 추가
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_plan TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_purchase TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_bid TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_plan_file_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_purchase_file_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_bid_file_name TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_plan_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_purchase_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_bid_file_size BIGINT DEFAULT 0;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_plan_file_url TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_purchase_file_url TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS doc_bid_file_url TEXT DEFAULT '';
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS ai_proposal_data JSONB;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS ai_purchase_data JSONB;
ALTER TABLE procurement_services ADD COLUMN IF NOT EXISTS ai_bid_data JSONB;
