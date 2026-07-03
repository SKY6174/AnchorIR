-- 004_insert_viva100_press.sql
-- 브릿지경제에서 보도된 울산과학대학교 라이즈(RISE)사업단 출범 관련 기사 등록 쿼리

-- 1. 기사 데이터 삽입 (1차년도 year: 1 매핑)
INSERT INTO public.press_releases (year, type, media, title, broadcast_date, content_url, press_content)
VALUES 
(
    1, 
    '신문', 
    '브릿지경제', 
    '울산과학대, 2025년 라이즈(RISE)사업단 공식 출범… 지산학 협력 본격화', 
    '2025-01-24 10:00:00+09', 
    'https://www.viva100.com/main/view.php?key=20250124010008745', 
    '울산과학대학교가 지역 혁신성장을 견인할 RISE사업단을 총장 직속기구로 출범시키고 본격적인 활동에 돌입했다. 울산과학대는 전문대학 중 전국 최고 수준의 사업비를 확보해 AI 전문인력 양성 및 지역 특화 지산학 연계 고도화 프로그램을 적극 가동할 예정이다.'
)
ON CONFLICT DO NOTHING;
