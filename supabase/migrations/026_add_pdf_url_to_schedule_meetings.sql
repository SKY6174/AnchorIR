-- 026_add_pdf_url_to_schedule_meetings.sql
-- 회의록 테이블(schedule_meetings)에 PDF 문서를 별도로 업로드하여 링크를 저장하기 위한 pdf_url 컬럼을 추가합니다.

ALTER TABLE schedule_meetings ADD COLUMN IF NOT EXISTS pdf_url TEXT;
