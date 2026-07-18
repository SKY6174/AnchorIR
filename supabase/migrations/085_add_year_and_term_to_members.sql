-- 💡 [Supabase DB 마이그레이션 규칙 7 준수]
-- committee_members 테이블에 연차(year) 및 임기(term) 컬럼 추가 및 스키마 캐시 새로고침

ALTER TABLE committee_members ADD COLUMN IF NOT EXISTS year VARCHAR(10) DEFAULT '2';
ALTER TABLE committee_members ADD COLUMN IF NOT EXISTS term VARCHAR(100);

-- Supabase API 스키마 캐시 즉시 강제 릴로드
NOTIFY pgrst, 'reload schema';
