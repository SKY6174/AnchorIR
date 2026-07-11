-- 067_grant_scholarships_view_permission.sql
-- 로그인된 인증 세션(authenticated 롤)이 scholarships_view 뷰 및 관련 테이블들을 조회할 수 있도록 SQL 권한을 안전하게 개방합니다.

-- 1. scholarships_view 뷰에 대한 SELECT 권한 인가
GRANT SELECT ON public.scholarships_view TO authenticated;
GRANT SELECT ON public.scholarships_view TO service_role;

-- 2. 뷰가 참조하고 있는 기본 장학금 관련 데이터 테이블들(존재 시)에 대한 SELECT 권한 보강 인가
GRANT SELECT ON public.scholarships TO authenticated;
GRANT SELECT ON public.scholarships TO service_role;
