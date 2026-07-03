-- 005_insert_ksilbo_press.sql
-- 경상일보에서 보도된 울산과학대학교 김기범 교수의 '2025 라이즈스타' 선정 기사 등록 쿼리

-- 1. 기사 데이터 삽입 (1차년도 year: 1 매핑)
INSERT INTO public.press_releases (year, type, media, title, broadcast_date, content_url, press_content)
VALUES 
(
    1, 
    '신문', 
    '경상일보', 
    '울산과학대 김기범 교수, ''2025 라이즈스타'' 선정… RISE 사업 교육혁신 공로', 
    '2025-12-18 10:00:00+09', 
    'https://www.ksilbo.co.kr/news/articleView.html?idxno=1004561', 
    '울산과학대학교 기계공학부 김기범 교수가 RISE(지역혁신중심 대학지원체계) 사업 기반의 지역 산업 발전과 대학 교육 혁신에 기여한 공로를 인정받아 2025 라이즈스타(RISE-Star)에 선정됐다. 김 교수는 지산학 연계 맞춤형 전공 트랙 개발과 산업체 애로 기술 해결 등을 통해 RISE 사업의 성공적인 지역 안착과 청년 정주 지원에 공헌했다.'
)
ON CONFLICT DO NOTHING;
