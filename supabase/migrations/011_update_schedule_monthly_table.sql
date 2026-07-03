-- 1. 기존의 단순 일자/시간 기반 schedule_monthly 테이블 삭제
DROP TABLE IF EXISTS schedule_monthly;

-- 2. 일정 유형, 관련 부서, 시작/종료 일시 컬럼을 보강한 신규 구조 생성
CREATE TABLE schedule_monthly (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- '행사', '회의', '위원회', '기타'
    dept TEXT NOT NULL, -- '사업운영팀', 'ECC센터', 'ICC센터', 'RCC센터', 'AID-X지원센터', '울산늘봄누리센터', '신산업특화센터'
    start_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 시작일시
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,   -- 종료일시
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 행 수준 보안(RLS) 활성화
ALTER TABLE schedule_monthly ENABLE ROW LEVEL SECURITY;

-- 4. 익명(anon) 및 인증 사용자 전원에게 전권(ALL) 허용 정책 배포
DROP POLICY IF EXISTS "Allow anon and auth on schedule_monthly" ON schedule_monthly;
CREATE POLICY "Allow anon and auth on schedule_monthly" ON schedule_monthly
    TO anon, authenticated USING (true) WITH CHECK (true);
