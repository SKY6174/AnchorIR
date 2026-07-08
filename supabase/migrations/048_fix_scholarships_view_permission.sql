-- 048_fix_scholarships_view_permission.sql
-- scholarships_view 및 scholarships 테이블에 대한 authenticated 롤의 권한을 완전 복구합니다.
-- pgp_sym_decrypt 복호화 뷰의 런타임 권한 거부(Permission Denied) 버그를 예방하기 위해 소유자를 postgres로 이전합니다.

ALTER VIEW public.scholarships_view OWNER TO postgres;
ALTER TABLE public.scholarships OWNER TO postgres;

GRANT ALL PRIVILEGES ON public.scholarships TO authenticated;
GRANT ALL PRIVILEGES ON public.scholarships_view TO authenticated;

GRANT ALL PRIVILEGES ON public.scholarships TO postgres;
GRANT ALL PRIVILEGES ON public.scholarships_view TO postgres;

-- 2차 확인용: authenticator 및 authenticated, service_role 에 SELECT 권한 확실히 GRANT
GRANT SELECT ON public.scholarships_view TO authenticated;
GRANT SELECT ON public.scholarships_view TO service_role;
