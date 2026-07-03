-- 003_insert_song_kyung_young_press.sql
-- 한국대학신문에서 보도된 울산과학대학교 송경영 라이즈사업단장의 고특회계 토론 기사 등록 쿼리

-- 1. 기사 데이터 삽입 (1차년도 year: 1 매핑)
INSERT INTO public.press_releases (year, type, media, title, broadcast_date, content_url, press_content)
VALUES 
(
    1, 
    '신문', 
    '한국대학신문', 
    '송경영 울산과학대 단장, "고특회계 전문대 성과 창출 위해 RISE 연계 고도화 필요"', 
    '2025-05-22 10:00:00+09', 
    'https://news.unn.net/news/articleView.html?idxno=547120', 
    '송경영 울산과학대학교 산학협력단장(RISE사업단장 겸임)은 제4차 고등교육재정 혁신 토론회에 참석해 전문대학에 대한 고특회계 성과와 발전 방향을 발표했다. 송 단장은 고등·평생교육지원특별회계를 통한 전문대학 교육 환경 개선 및 재정 성과를 공유하며, 향후 RISE 체계 안에서 직업교육 플랫폼의 고도화 필요성을 강조했다.'
)
ON CONFLICT DO NOTHING;
