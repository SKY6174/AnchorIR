-- supabase/migrations/072_alter_asset_reservations.sql
-- 7번 규칙(Supabase 쿼리 관리)에 따라 순서 번호를 붙여서 작성합니다.
-- 공간 예약 테이블(asset_reservations)에 외부 조직 이용 시 동적 데이터를 수용하기 위한 칼럼을 보완합니다.

ALTER TABLE public.asset_reservations 
ADD COLUMN IF NOT EXISTS custom_dept VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS actual_user_name VARCHAR(255) DEFAULT '';

COMMENT ON COLUMN public.asset_reservations.custom_dept IS '외부 사용기관 직접 입력 부서명';
COMMENT ON COLUMN public.asset_reservations.actual_user_name IS '외부 부서의 실제 이용자명';
