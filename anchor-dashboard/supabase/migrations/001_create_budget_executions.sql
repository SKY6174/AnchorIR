-- 💡 [교육용 한글 주석] 예산 집행률 관리를 위한 집행 내역(월별) 저장 테이블 스키마입니다.
-- 월별 집행 데이터를 여러 차례 올릴 때 중복 적재되는 것을 막기 위한 고유 제약 조건(Unique Index)을 포함합니다.

CREATE TABLE IF NOT EXISTS budget_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL, -- 연차 (1차년도: 1, 2차년도: 2)
    month_label VARCHAR(50) NOT NULL, -- 집행월 ('26.3월', '26.4월', ..., '27.2월')
    program_id VARCHAR(100) NOT NULL, -- 프로그램 ID
    program_name TEXT NOT NULL, -- 프로그램명
    funding_source VARCHAR(50) NOT NULL, -- 국비 / 시비
    expense_category VARCHAR(150), -- 비목항목명 (사업비 비목)
    detail_usage TEXT, -- 세부내역 (사용용도)
    enara_category VARCHAR(100), -- e나라 비목
    account_subject VARCHAR(150), -- 계정과목
    account_detail VARCHAR(150), -- 계정과목 세목
    execution_date DATE, -- 집행일자
    summary TEXT, -- 적요
    client TEXT, -- 거래처
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0, -- 집행액
    resolution_no VARCHAR(100) NOT NULL, -- 결의번호
    manager VARCHAR(150), -- 담당자
    budget_type VARCHAR(50) NOT NULL DEFAULT 'main', -- 본예산('main') / 이월예산('carryover') 분리 영역
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 💡 중복 적재 방지 유니크 인덱스 생성
-- 동일 결의번호, 프로그램 ID, 집행일자, 집행액, 예산 구분이 같으면 중복으로 판단하여 덮어쓰거나 생략합니다.
CREATE UNIQUE INDEX IF NOT EXISTS uq_budget_execution_key 
ON budget_executions(resolution_no, program_id, execution_date, amount, budget_type);
