-- press_releases 테이블에 image_url (기사 본문 첫 번째 이미지 URL) 컬럼 추가
ALTER TABLE press_releases ADD COLUMN IF NOT EXISTS image_url TEXT;
