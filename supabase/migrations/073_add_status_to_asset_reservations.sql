-- supabase/migrations/073_add_status_to_asset_reservations.sql
-- 7번 규칙(Supabase 쿼리 관리)에 따라 순서 번호를 붙여서 작성합니다.
-- 공간 예약 테이블(asset_reservations)에 결재/승인 상태를 나타내는 status 컬럼을 보완합니다.

ALTER TABLE public.asset_reservations 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT '승인대기';

COMMENT ON COLUMN public.asset_reservations.status IS '예약 승인 상태 (승인대기, 승인완료)';
