-- ==============================================================================
-- 💡 committee_meetings 테이블에 responses_data JSONB 컬럼 안전 추가 마이그레이션 SQL
-- ==============================================================================

ALTER TABLE committee_meetings 
ADD COLUMN IF NOT EXISTS responses_data JSONB DEFAULT '[]'::jsonb;
