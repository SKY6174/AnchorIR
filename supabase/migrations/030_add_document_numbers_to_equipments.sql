-- 핵심 기자재 테이블에 3대 결재번호 컬럼 추가
ALTER TABLE procurement_equipment ADD COLUMN IF NOT EXISTS doc_plan TEXT DEFAULT '';
ALTER TABLE procurement_equipment ADD COLUMN IF NOT EXISTS doc_purchase TEXT DEFAULT '';
ALTER TABLE procurement_equipment ADD COLUMN IF NOT EXISTS doc_bid TEXT DEFAULT '';
