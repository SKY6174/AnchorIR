-- 080_create_orderly_courses.sql
-- 주문식 교육과정 및 학과/전공별 운영 정보를 관리하는 데이터베이스 테이블 생성 및 초기 데이터 삽입

-- 1. 학과/전공별 주문식 교육과정 운영 정보 (PM교수 현황) 테이블 생성
CREATE TABLE IF NOT EXISTS orderly_courses_depts (
    id SERIAL PRIMARY KEY,
    dept VARCHAR(100) NOT NULL UNIQUE,          -- 학과/전공명
    pm_name VARCHAR(50) NOT NULL,               -- PM교수 이름
    courses TEXT NOT NULL,                      -- 운영중인 주문식 교육과정 요약
    total_students INTEGER DEFAULT 0,           -- 참여학생 수 (총학생수)
    unique_students INTEGER DEFAULT 0,          -- 참여학생 수 (중복제외)
    note TEXT,                                  -- 비고
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 개별 주문식 교육과정 교과목 상세 테이블 생성
CREATE TABLE IF NOT EXISTS orderly_courses (
    id VARCHAR(50) PRIMARY KEY,                 -- 교과목 고유 ID (예: cap_1, pbl_1, ai_1)
    type VARCHAR(50) NOT NULL,                  -- 교육과정 유형 (예: 캡스톤디자인, 기업형 PBL, 옴니버스, OJT 병행, AI 리터러시)
    dept VARCHAR(100) NOT NULL,                 -- 학과명
    name VARCHAR(150) NOT NULL,                 -- 교과목명
    professor VARCHAR(100) NOT NULL,            -- 담당교수
    students INTEGER DEFAULT 0,                 -- 학생수
    budget BIGINT DEFAULT 0,                    -- 배정예산 (원)
    year INTEGER DEFAULT 2,                     -- 연차
    is_foreign BOOLEAN DEFAULT FALSE,           -- 외국인 유학생 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS (Row Level Security) 설정 활성화
ALTER TABLE orderly_courses_depts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderly_courses ENABLE ROW LEVEL SECURITY;

-- 4. orderly_courses_depts RLS 정책 (전체 공개 및 CRUD 허용 - 기존 079번 세미나 테이블과 동일)
CREATE POLICY "Allow anonymous read access on orderly_courses_depts" 
ON orderly_courses_depts FOR SELECT TO public USING (true);

CREATE POLICY "Allow anonymous insert on orderly_courses_depts" 
ON orderly_courses_depts FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow anonymous update on orderly_courses_depts" 
ON orderly_courses_depts FOR UPDATE TO public USING (true);

CREATE POLICY "Allow anonymous delete on orderly_courses_depts" 
ON orderly_courses_depts FOR DELETE TO public USING (true);

-- 5. orderly_courses RLS 정책
CREATE POLICY "Allow anonymous read access on orderly_courses" 
ON orderly_courses FOR SELECT TO public USING (true);

CREATE POLICY "Allow anonymous insert on orderly_courses" 
ON orderly_courses FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow anonymous update on orderly_courses" 
ON orderly_courses FOR UPDATE TO public USING (true);

CREATE POLICY "Allow anonymous delete on orderly_courses" 
ON orderly_courses FOR DELETE TO public USING (true);

-- 6. 학과/전공별 운영 정보 (PM교수 현황) 초기 데이터 인서트
INSERT INTO orderly_courses_depts (dept, pm_name, courses, total_students, unique_students, note) VALUES
('간호학부', '공경란', '기본간호학 1, 통합간호학', 334, 310, '통합간호학(PBL) 및 기본간호학(AI) 연계'),
('게임영상학과', '이재현', '3D애니메이션 1, 커뮤니케이션디자인 1', 60, 55, '3D애니메이션 및 OJT 병행 운영'),
('국제학부', '이연주', 'Smartwork 실무, 관광마케팅조실무, 호텔경영실무', 26, 22, '외국인 유학생 전용 주문식 과정 운영'),
('글로벌비즈니스학과', '서용한', 'Smartwork 실무, 관광마케팅조사 실무, 호텔경영론', 50, 45, '유학생 관광마케팅 및 Smartwork 실무 연계'),
('기계공학부 기계시스템전공', '이정준', '전공종합설계, 챌린지프로젝트(종합설계및창업)(2), 기계품질데이터분석', 186, 165, '캡스톤디자인 중심 종합설계 교육'),
('기계공학부 기계설비전공', '고형석', '설비진단, 스마트제조실무', 50, 45, '설비진단 및 스마트제조 중심'),
('물리치료학과', '김원호', '신경계물리치료중재, 소아물리치료', 56, 50, '신경계 및 소아 물리치료 특화 PBL'),
('사회복지학과', '이수경', '청소년복지론, 노인상담', 65, 60, '청소년 및 노인복지 융합형 과정'),
('세무회계학과', '천정애', '재무제표론', 37, 37, '재무제표론 중심 세무 실무 교육'),
('스포츠건강재활학과', '김원문', '근골격계재활운동, 근육재활심화테크닉', 29, 25, '근골격계 재활 및 심화 테크닉 과정'),
('스포츠재활학부 스포츠재활전공', '김원문', '교정운동및실습(1), 근육재활심화테크닉(1), 스포츠의학개론, 스포츠심리학', 90, 80, '교정운동 및 스포츠의학 융합 과정'),
('스포츠재활학부 스포츠지도전공', '서봉한', '보디빌딩지도법, 스포츠윤리', 49, 45, '보디빌딩 및 스포츠윤리 지도 특화'),
('식품영양학과', '김일낭', '-', 0, 0, '3차년도 주문식 과정 개설 예정'),
('실내건축디자인과', '김동욱', '실내건축캡스톤디자인, 실내건축설계(1)', 34, 30, '실내건축 캡스톤디자인 연계'),
('융합안전공학과', '한영진', '통합안전진로탐색, 프로그래밍언어', 85, 78, '통합안전진로 및 프로그래밍 연계'),
('전기전자공학부 스마트전자전공', '조영', '캡스톤디자인(1), 파이썬프로그래밍', 35, 32, '스마트전자 캡스톤 및 파이썬 연계'),
('조선해양시스템공학과', '양승호', '배관시스템설계, 부유체안정성', 25, 22, '배관설계 및 부유체 안정성 실무'),
('치위생학과', '이동은', '구강미생물학, 임상전단계실습 1, 구강보건교육학및실습, 구강조직학, 구강생리학', 456, 410, '구강미생물학(PBL) 및 임상실습 융합'),
('컴퓨터공학과', '김금석', '종합설계, 컴퓨터구조, 객체지향프로그래밍(1)', 138, 125, '종합설계 및 컴퓨터구조 PBL 연계'),
('호텔조리제빵과', '채영철', '궁중요리실습, 에스프레소커피실습, Italian Cooking, AI-DX 초콜릿및케이크실습', 278, 250, 'AI-DX 제빵 및 이탈리안 요리 융합'),
('화학공학과', '송민석', '챌린지프로젝트(종합설계및창업), 화학장치운전실무, 현장사례연구, GMP실무', 87, 80, '현장사례연구 및 GMP실무 특화')
ON CONFLICT (dept) DO UPDATE SET
    pm_name = EXCLUDED.pm_name,
    courses = EXCLUDED.courses,
    total_students = EXCLUDED.total_students,
    unique_students = EXCLUDED.unique_students,
    note = EXCLUDED.note;

-- 7. 개별 주문식 교육과정 교과목 초기 데이터 인서트
INSERT INTO orderly_courses (id, type, dept, name, professor, students, budget, year, is_foreign) VALUES
('cap_1', '캡스톤디자인', '기계공학부', '전공종합설계', '이진우', 109, 1440000, 2, FALSE),
('cap_2', '캡스톤디자인', '기계공학부', '챌린지프로젝트 (종합설계및창업)(2)', '김민갑', 40, 4700000, 2, FALSE),
('cap_3', '캡스톤디자인', '실내건축디자인과', '실내건축캡스톤디자인', '김동욱', 15, 3200000, 2, FALSE),
('cap_4', '캡스톤디자인', '전기전자공학부', '캡스톤디자인(1)', '조영', 9, 2200000, 2, FALSE),
('cap_5', '캡스톤디자인', '컴퓨터공학과', '종합설계', '김금석', 16, 3200000, 2, FALSE),
('cap_6', '캡스톤디자인', '컴퓨터공학과', '종합설계', '김성열', 18, 2300000, 2, FALSE),
('cap_7', '캡스톤디자인', '화학공학과', '챌린지프로젝트 (종합설계및창업)', '유승민', 21, 2900000, 2, FALSE),

('pbl_1', '기업형 PBL', '간호학부', '통합간호학', '김민경', 173, 3600000, 2, FALSE),
('pbl_2', '기업형 PBL', '물리치료학과', '신경계물리치료중재', '김원호', 28, 2200000, 2, FALSE),
('pbl_3', '기업형 PBL', '물리치료학과', '소아물리치료', '송주영', 28, 2200000, 2, FALSE),
('pbl_4', '기업형 PBL', '사회복지학과', '청소년복지론', '이수경', 34, 2480000, 2, FALSE),
('pbl_5', '기업형 PBL', '스포츠건강재활학과', '근골격계재활운동', '김원문', 10, 1560000, 2, FALSE),
('pbl_6', '기업형 PBL', '스포츠재활학부', '교정운동및실습(1)', '김원문', 13, 1500000, 2, FALSE),
('pbl_7', '기업형 PBL', '치위생학과', '구강미생물학', '이동은', 102, 6060000, 2, FALSE),
('pbl_8', '기업형 PBL', '치위생학과', '임상전단계실습 1', '이가연', 82, 5980000, 2, FALSE),
('pbl_9', '기업형 PBL', '컴퓨터공학과', '컴퓨터구조', '김성열', 60, 4500000, 2, FALSE),
('pbl_10', '기업형 PBL', '글로벌비즈니스학과', '관광마케팅조사 실무', '서용한', 13, 1200000, 2, TRUE),

('omn_1', '옴니버스', '스포츠건강재활학과', '근육재활심화테크닉', '김원문', 9, 1200000, 2, FALSE),
('omn_2', '옴니버스', '스포츠재활학부', '근육재활심화테크닉(1)', '김원문', 13, 900000, 2, FALSE),
('omn_3', '옴니버스', '스포츠재활학부', '보디빌딩지도법', '서봉한', 18, 900000, 2, FALSE),
('omn_4', '옴니버스', '융합안전공학과', '통합안전진로탐색', '한영진', 66, 2100000, 2, FALSE),
('omn_5', '옴니버스', '치위생학과', '구강보건교육학및실습', '유진실', 82, 1200000, 2, FALSE),
('omn_6', '옴니버스', '호텔조리제빵과', '궁중요리실습', '서경화', 69, 3000000, 2, FALSE),
('omn_7', '옴니버스', '호텔조리제빵과', '에스프레소커피실습', '전유명', 71, 3000000, 2, FALSE),
('omn_8', '옴니버스', '호텔조리제빵과', 'Italian Cooking', '전유명', 69, 3000000, 2, FALSE),
('omn_9', '옴니버스', '화학공학과', '화학장치운전실무', '송성국', 20, 1200000, 2, FALSE),
('omn_10', '옴니버스', '국제학부', '관광마케팅조사실무', '서용한', 6, 1200000, 2, TRUE),
('omn_11', '옴니버스', '국제학부', '호텔경영실무', '이현찬', 16, 600000, 2, TRUE),
('omn_12', '옴니버스', '글로벌비즈니스학과', '호텔경영론', '이연주', 6, 1200000, 2, TRUE),

('ojt_1', 'OJT 병행', '게임영상학과', '커뮤니케이션디자인 1', '이재현', 20, 3500000, 2, FALSE),
('ojt_2', 'OJT 병행', '기계공학부', '설비진단', '고형석', 35, 3050000, 2, FALSE),
('ojt_3', 'OJT 병행', '화학공학과', '현장사례연구', '송민석, 장광일', 2, 1100000, 2, FALSE),

('ai_1', 'AI 리터러시', '간호학부', '기본간호학 1', '공경란', 161, 500000, 2, FALSE),
('ai_2', 'AI 리터러시', '게임영상학과', '3D애니메이션 1', '김지수', 40, 500000, 2, FALSE),
('ai_3', 'AI 리터러시', '기계공학부', '기계품질데이터분석', '김기범', 37, 500000, 2, FALSE),
('ai_4', 'AI 리터러시', '기계공학부', '스마트제조실무', '고형석', 15, 500000, 2, FALSE),
('ai_5', 'AI 리터러시', '사회복지학과', '노인상담', '이수경', 31, 500000, 2, FALSE),
('ai_6', 'AI 리터러시', '세무회계학과', '재무제표론', '한정희', 37, 500000, 2, FALSE),
('ai_7', 'AI 리터러시', '스포츠건강재활학과', '근골격계재활운동', '김원문', 10, 200000, 2, FALSE),
('ai_8', 'AI 리터러시', '스포츠재활학부', '스포츠의학개론', '김원문', 38, 500000, 2, FALSE),
('ai_9', 'AI 리터러시', '스포츠재활학부', '스포츠심리학', '김기훈', 26, 500000, 2, FALSE),
('ai_10', 'AI 리터러시', '스포츠재활학부', '스포츠윤리', '서봉한', 31, 500000, 2, FALSE),
('ai_11', 'AI 리터러시', '실내건축디자인과', '실내건축설계(1)', '김동욱', 19, 500000, 2, FALSE),
('ai_12', 'AI 리터러시', '융합안전공학과', '프로그래밍언어', '정일한', 19, 500000, 2, FALSE),
('ai_13', 'AI 리터러시', '전기전자공학부', '파이썬프로그래밍', '장민호', 26, 500000, 2, FALSE),
('ai_14', 'AI 리터러시', '조선해양시스템공학과', '배관시스템설계', '양승호', 13, 1200000, 2, FALSE),
('ai_15', 'AI 리터러시', '조선해양시스템공학과', '부유체안정성', '양승호', 12, 1200000, 2, FALSE),
('ai_16', 'AI 리터러시', '치위생학과', '구강조직학', '이가연', 108, 500000, 2, FALSE),
('ai_17', 'AI 리터러시', '치위생학과', '구강생리학', '이동은', 82, 500000, 2, FALSE),
('ai_18', 'AI 리터러시', '컴퓨터공학과', '객체지향프로그래밍(1)', '김금석', 44, 500000, 2, FALSE),
('ai_19', 'AI 리터러시', '호텔조리제빵과', 'AI-DX 초콜릿및케이크실습', '신언환', 69, 7000000, 2, FALSE),
('ai_20', 'AI 리터러시', '화학공학과', 'GMP실무', '장광일', 44, 500000, 2, FALSE),
('ai_21', 'AI 리터러시', '국제학부', 'Smartwork 실무', '서용한', 4, 500000, 2, TRUE),
('ai_22', 'AI 리터러시', '글로벌비즈니스학과', 'Smartwork 실무', '서용한', 31, 500000, 2, TRUE)
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    dept = EXCLUDED.dept,
    name = EXCLUDED.name,
    professor = EXCLUDED.professor,
    students = EXCLUDED.students,
    budget = EXCLUDED.budget,
    year = EXCLUDED.year,
    is_foreign = EXCLUDED.is_foreign;
