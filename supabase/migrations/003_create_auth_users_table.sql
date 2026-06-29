-- 003_create_auth_users_table.sql
-- 회원 가입 정보 및 관리자 승인 상태를 기록할 회원 테이블을 신설합니다.
CREATE TABLE IF NOT EXISTS rise_users (
    id TEXT PRIMARY KEY,
    pw TEXT NOT NULL, -- SHA-256 단방향 해시 암호화값 보관
    name TEXT NOT NULL,
    role_key TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 기본 관리자 및 연구원 계정 시드 적재 (비밀번호 '1234'의 SHA-256 해시값)
-- '1234' -> SHA-256 해시: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
INSERT INTO rise_users (id, pw, name, role_key, approved) VALUES
('director', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '송경영 사업단장', 'DIRECTOR', true),
('hq_head', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '김현수 총괄본부장', 'HQ_HEAD', true),
('ecc_head', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '이동은 ECC센터장', 'CENTER_ECC', true),
('special_head', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '홍진숙 신산업특화센터장', 'CENTER_SPECIAL', true),
('manager', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '심현미 운영팀장', 'TEAM_LEADER', true),
('researcher', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '이은주 선임연구원', 'RESEARCHER', true)
ON CONFLICT (id) DO NOTHING;

-- Supabase에서 클라이언트 Anon Key를 통해 가입(INSERT) 및 조회가 가능하도록 Row Level Security(RLS)를 비활성화합니다.
ALTER TABLE rise_users DISABLE ROW LEVEL SECURITY;

