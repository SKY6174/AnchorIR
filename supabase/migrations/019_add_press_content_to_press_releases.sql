-- press_releases 테이블에 보도내용(press_content) 컬럼 추가
ALTER TABLE press_releases ADD COLUMN IF NOT EXISTS press_content TEXT;
