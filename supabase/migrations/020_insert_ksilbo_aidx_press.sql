-- 020_insert_ksilbo_aidx_press.sql
-- 경상일보에서 보도된 울산과학대학교 AIDX 재학생·재직자 공동교육 관련 기사 등록 쿼리

-- 1. 기사 데이터 삽입 (1차년도 year: 1 매핑)
INSERT INTO public.press_releases (year, type, media, title, broadcast_date, content_url, press_content)
VALUES 
(
    1, 
    '신문', 
    '경상일보', 
    '대학생·직장인 힘 모으니 현장문제 술술 풀렸다', 
    '2026-02-04 15:00:00+09', 
    'https://www.ksilbo.co.kr/news/articleView.html?idxno=1006500', 
    '울산과학대학교가 HD현대이앤티와 손잡고 ''2025학년도 지역혁신중심 대학지원체계(RISE)사업''의 일환으로 개설한 ''AIDX 재학생·재직자 공동교육'' 과정이 현장 애로 문제를 해결하며 성공적으로 마무리됐다. 대학생과 직장인이 협력해 40시간 동안 집중 프로젝트를 수행하며 공동교육 상장 수여식을 가졌다.'
)
ON CONFLICT DO NOTHING;
