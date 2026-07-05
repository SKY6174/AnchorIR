-- 1. 기존 테이블 제거
DROP TABLE IF EXISTS procurement_equipment;

-- 2. 새 규격으로 테이블 생성
CREATE TABLE IF NOT EXISTS procurement_equipment (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,                      -- 사업 연차
    unit TEXT NOT NULL,                         -- 단위과제 식별자
    seq INTEGER NOT NULL DEFAULT 1,             -- 리스트 정렬 순번
    dept_name TEXT DEFAULT '',                  -- 배정 학과명
    division_name TEXT DEFAULT '',              -- 배정 부서명
    item_name TEXT NOT NULL,                    -- 기자재 명칭
    unit_price BIGINT NOT NULL DEFAULT 0,       -- 기자재 단가 (원화 기준)
    quantity INTEGER NOT NULL DEFAULT 1,        -- 구입 수량
    description TEXT DEFAULT '',                -- 구입 목적 및 활용 계획
    operation TEXT DEFAULT '교과목(정규)',       -- 운영 구분
    password TEXT DEFAULT '1234',               -- 수정 및 삭제 비밀번호
    related_docs TEXT DEFAULT '',               -- 관련문서 번호 (다중 문서번호)
    date_p DATE,                                -- 기획(P) 단계 일자
    date_a DATE,                                -- 승인(A) 단계 일자
    date_b DATE,                                -- 입찰(B) 단계 일자
    date_pr DATE,                               -- 구매(Pr) 단계 일자
    date_i DATE,                                -- 검수(I) 단계 일자
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. RLS 비활성화
ALTER TABLE procurement_equipment DISABLE ROW LEVEL SECURITY;
