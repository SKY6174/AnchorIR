-- 070_add_event_id_to_schedule_monthly.sql
-- schedule_monthly 테이블에 주요 행사(schedule_events) 매핑 ID 컬럼 추가 및 연쇄 삭제 제약 설정
ALTER TABLE schedule_monthly ADD COLUMN IF NOT EXISTS event_id integer REFERENCES schedule_events(id) ON DELETE CASCADE;
