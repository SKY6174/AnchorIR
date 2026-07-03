-- 1. 연차별 프로젝트 통합 트리 데이터 테이블
CREATE TABLE IF NOT EXISTS projects_data (
    id SERIAL PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 협약서 관리 테이블
CREATE TABLE IF NOT EXISTS agreements (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    center TEXT NOT NULL,
    organizations JSONB NOT NULL,
    subject_univ TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    contents TEXT[] NOT NULL,
    file_name TEXT,
    file_data TEXT, -- Base64 원본 텍스트
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 구매용역 - 환경개선 테이블
CREATE TABLE IF NOT EXISTS procurement_env (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    unit TEXT NOT NULL,
    plan TEXT,
    meeting_result TEXT,
    progress TEXT,
    budget_plan BIGINT NOT NULL DEFAULT 0,
    budget_spent BIGINT NOT NULL DEFAULT 0,
    location TEXT,
    purpose TEXT,
    birdseye_view TEXT,
    blueprints TEXT,
    utilization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 구매용역 - 기자재 구입 및 운영 테이블
CREATE TABLE IF NOT EXISTS procurement_equipment (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    unit TEXT NOT NULL,
    name TEXT NOT NULL,
    program TEXT,
    department TEXT,
    schedule TEXT,
    budget_plan BIGINT NOT NULL DEFAULT 0,
    budget_spent BIGINT NOT NULL DEFAULT 0,
    op_plan TEXT,
    op_performance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. 구매용역 - 주요 용역 테이블 (500만원 이상)
CREATE TABLE IF NOT EXISTS procurement_services (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    purpose TEXT,
    provider_qual TEXT,
    step INTEGER NOT NULL DEFAULT 1,
    budget_plan BIGINT NOT NULL DEFAULT 0,
    budget_spent BIGINT NOT NULL DEFAULT 0,
    op_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. 일정관리 - 월간 일정 테이블
CREATE TABLE IF NOT EXISTS schedule_monthly (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    time TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. 일정관리 - 행사 일정 테이블
CREATE TABLE IF NOT EXISTS schedule_events (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    datetime TEXT,
    location TEXT,
    attendees_internal TEXT,
    attendees_external TEXT,
    program TEXT,
    purpose TEXT,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. 일정관리 - 회의 일정 테이블
CREATE TABLE IF NOT EXISTS schedule_meetings (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    datetime TEXT,
    location TEXT,
    attendees_internal TEXT,
    attendees_external TEXT,
    agenda TEXT,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. 개발자 편의성을 위해 로컬 수준에서 RLS를 비활성화하여 접근 권한 에러를 방지합니다.
ALTER TABLE projects_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_env DISABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_monthly DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_meetings DISABLE ROW LEVEL SECURITY;
