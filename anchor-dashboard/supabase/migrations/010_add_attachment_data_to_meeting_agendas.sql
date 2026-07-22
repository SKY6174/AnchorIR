-- ========================================================
-- [마이그레이션 SQL] 010_add_attachment_data_to_meeting_agendas.sql
-- meeting_agendas 테이블에 개별 안건 심의 첨부자료 컬럼(attachment_name, attachment_data) 추가
-- ========================================================

ALTER TABLE meeting_agendas ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE meeting_agendas ADD COLUMN IF NOT EXISTS attachment_data TEXT;

COMMENT ON COLUMN meeting_agendas.attachment_name IS '개별 안건 심의 첨부자료 파일명';
COMMENT ON COLUMN meeting_agendas.attachment_data IS '개별 안건 심의 첨부자료 PDF Base64 바이너리 데이터';
