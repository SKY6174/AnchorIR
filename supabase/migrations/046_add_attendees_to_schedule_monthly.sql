-- schedule_monthly 테이블에 참여 대상자(attendees) 컬럼 추가
ALTER TABLE schedule_monthly ADD COLUMN IF NOT EXISTS attendees TEXT;
