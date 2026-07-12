-- 1. 교육환경 공간 예약 테이블
CREATE TABLE IF NOT EXISTS public.asset_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_name VARCHAR(100) NOT NULL, -- AIDX대강의실, AIDX 1교육실, AIDX 2교육실, 늘봄누리센터강의실, 산단1층회의실
    reserved_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    dept VARCHAR(100) NOT NULL, -- 사용부서
    reserver_name VARCHAR(100) NOT NULL, -- 예약자명
    purpose TEXT, -- 사용 목적
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 기자재 현황 및 사용 관리 테이블
CREATE TABLE IF NOT EXISTS public.asset_equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_number VARCHAR(100) UNIQUE NOT NULL, -- 물품번호
    barcode VARCHAR(100) NOT NULL, -- 바코드
    stock_location VARCHAR(150) NOT NULL, -- 재고위치
    category VARCHAR(50) NOT NULL, -- 'ai_dx' or 'other'
    usage_type VARCHAR(100) NOT NULL, -- 정규교과, 비정규교과, 평생직업교육, 재직자과정, 기타
    item_name VARCHAR(150) NOT NULL, -- 기자재 품명
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 설정 및 Guest/Public 읽기 전용 및 인증유저 편집 권한 부여
ALTER TABLE public.asset_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_equipments ENABLE ROW LEVEL SECURITY;

-- Select 권한 오픈
DROP POLICY IF EXISTS "Allow public read access on asset_reservations" ON public.asset_reservations;
CREATE POLICY "Allow public read access on asset_reservations" ON public.asset_reservations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on asset_equipments" ON public.asset_equipments;
CREATE POLICY "Allow public read access on asset_equipments" ON public.asset_equipments FOR SELECT USING (true);

-- 수정 권한 오픈 (인증 및 익명 쓰기 모두 허용하여 로컬 개발/데모 상황 유연성 확보)
DROP POLICY IF EXISTS "Allow public modifications on asset_reservations" ON public.asset_reservations;
CREATE POLICY "Allow public modifications on asset_reservations" ON public.asset_reservations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public modifications on asset_equipments" ON public.asset_equipments;
CREATE POLICY "Allow public modifications on asset_equipments" ON public.asset_equipments FOR ALL USING (true) WITH CHECK (true);
