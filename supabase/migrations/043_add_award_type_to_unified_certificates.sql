-- 상장/이수증 통합 관리에 '상훈' 항목 추가
ALTER TABLE unified_certificates ADD COLUMN IF NOT EXISTS award_type TEXT;
