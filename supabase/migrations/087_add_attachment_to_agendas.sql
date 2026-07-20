-- 💡 [Supabase DB 마이그레이션 규칙 7 준수]
-- 개별 의결 안건별 자료 첨부 기능을 위해 meeting_agendas 테이블에 파일 첨부 컬럼 추가
ALTER TABLE meeting_agendas ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE meeting_agendas ADD COLUMN IF NOT EXISTS attachment_data TEXT;

-- PostgREST API 스키마 캐시 새로고침 신호 전송
NOTIFY pgrst, 'reload schema';
