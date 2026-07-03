-- 001_create_educational_videos.sql
-- 교육용 유튜브 영상 목록을 관리하기 위한 Supabase 데이터베이스 테이블 생성 쿼리

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS public.educational_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- 고유 식별자 (자동 생성되는 UUID)
    title TEXT NOT NULL,                                     -- 영상 제목
    video_id TEXT NOT NULL,                                  -- 유튜브 비디오 고유 ID (예: n2u5rXgGHDg)
    youtube_url TEXT NOT NULL,                               -- 유튜브 원본 주소 URL
    description TEXT,                                        -- 영상에 대한 추가 설명
    created_at TIMESTAMPTZ DEFAULT NOW()                     -- 영상이 등록된 시간 (기본값: 현재 시간)
);

-- 2. 코멘트 추가 (데이터베이스 테이블 및 컬럼 설명용)
COMMENT ON TABLE public.educational_videos IS '교육용 및 대시보드 표시용 유튜브 동영상 정보 테이블';
COMMENT ON COLUMN public.educational_videos.id IS '동영상 UUID';
COMMENT ON COLUMN public.educational_videos.title IS '동영상 제목';
COMMENT ON COLUMN public.educational_videos.video_id IS '유튜브 11자리 비디오 고유 ID';
COMMENT ON COLUMN public.educational_videos.youtube_url IS '유튜브 원본 URL';
COMMENT ON COLUMN public.educational_videos.description IS '동영상 세부 설명';
COMMENT ON COLUMN public.educational_videos.created_at IS '데이터 생성 일시';

-- 3. Row Level Security (RLS) 보안 정책 설정
-- DESIGN.md 및 Supabase 보안 요건 준수
-- 누구나 조회(SELECT)할 수 있지만, 데이터 추가/수정/삭제는 관리자(인증된 사용자)만 가능하도록 제한합니다.
ALTER TABLE public.educational_videos ENABLE ROW LEVEL SECURITY;

-- 3-1. 모두가 영상을 조회할 수 있도록 허용하는 정책 (SELECT)
-- (중복 실행 시 에러 방지를 위해 기존 정책이 있다면 먼저 삭제한 뒤 다시 생성합니다.)
DROP POLICY IF EXISTS "Allow public read access to videos" ON public.educational_videos;
CREATE POLICY "Allow public read access to videos" 
ON public.educational_videos 
FOR SELECT 
USING (true);

-- 3-2. 로그인한 관리자만 동영상을 등록, 수정, 삭제할 수 있도록 허용하는 정책 (ALL)
-- (중복 실행 시 에러 방지를 위해 기존 정책이 있다면 먼저 삭제한 뒤 다시 생성합니다.)
DROP POLICY IF EXISTS "Allow authorized users to manage videos" ON public.educational_videos;
CREATE POLICY "Allow authorized users to manage videos" 
ON public.educational_videos 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. 초기 테스트용 샘플 데이터 삽입
INSERT INTO public.educational_videos (title, video_id, youtube_url, description)
VALUES 
('울산과학대, 세계인의 날 행사 개최 #shorts', 'n2u5rXgGHDg', 'https://youtu.be/n2u5rXgGHDg', '2026년 7월 15일 보도자료 ubc 뉴스 방송본'),
('울산과학대학교 라이즈(RISE) 사업 안내 및 비전 소개', 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '사업단 홍보 및 비전 공유를 위한 전체 소개 교육 영상')
ON CONFLICT DO NOTHING;
