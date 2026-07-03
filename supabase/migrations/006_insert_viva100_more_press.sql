-- 006_insert_viva100_more_press.sql
-- 브릿지경제에서 보도된 울산과학대학교 U-RISE 스타트업 캠퍼스 지원사업 관련 기사 등록 쿼리

-- 1. 기사 데이터 삽입 (1차년도 year: 1 매핑)
INSERT INTO public.press_releases (year, type, media, title, broadcast_date, content_url, press_content)
VALUES 
(
    1, 
    '신문', 
    '브릿지경제', 
    '울산과학대 창업동아리, ''U-RISE 스타트업 캠퍼스'' 글로벌 역량 강화 프로그램 참여', 
    '2025-12-10 10:00:00+09', 
    'https://www.viva100.com/main/view.php?key=20251210010003429', 
    '울산과학대학교 창업동아리 학생들이 2025 U-RISE 스타트업 캠퍼스 지원사업의 일환으로 수도권 창업 생태계 및 글로벌 시장 개척을 위한 탐방 프로그램에 참여했다. 학생들은 창업 전문 기관 방문과 선배 창업가들과의 멘토링을 통해 라이즈(RISE) 체계 기반의 창업 실무 능력을 기르고 미래 창업가로서의 시야를 넓혔다.'
)
ON CONFLICT DO NOTHING;
