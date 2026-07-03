-- 1. press_releases (언론보도) 테이블 신설
CREATE TABLE IF NOT EXISTS press_releases (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    type TEXT NOT NULL,          -- '방송', '신문', '기타'
    media TEXT NOT NULL,         -- 매체
    title TEXT NOT NULL,         -- 제목
    broadcast_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 일시(시간 포함)
    content_url TEXT NOT NULL,   -- 링크 URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. RLS 활성화
ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;

-- 3. 정책 설정 (익명 및 인증된 사용자 모두 CRUD 전면 허용)
DROP POLICY IF EXISTS "Allow anon and auth on press_releases" ON press_releases;
CREATE POLICY "Allow anon and auth on press_releases" ON press_releases
  FOR ALL USING (true) WITH CHECK (true);
