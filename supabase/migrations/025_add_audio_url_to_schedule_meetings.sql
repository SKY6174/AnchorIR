-- 025_add_audio_url_to_schedule_meetings.sql
-- 회의록 테이블(schedule_meetings)에 음성 녹음 파일(MP3) 및 PDF 첨부 문서 링크를 저장하기 위한 audio_url 컬럼을 추가합니다.

ALTER TABLE schedule_meetings ADD COLUMN IF NOT EXISTS audio_url TEXT;
