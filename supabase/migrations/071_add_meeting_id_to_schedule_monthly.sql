-- 071_add_meeting_id_to_schedule_monthly.sql
-- schedule_monthly 테이블에 회의록(schedule_meetings) 매핑 ID 컬럼 추가 및 연쇄 삭제 제약 설정
ALTER TABLE schedule_monthly ADD COLUMN IF NOT EXISTS meeting_id integer REFERENCES schedule_meetings(id) ON DELETE CASCADE;
