-- ⚓ [031] 기자재 테이블 첨부파일 정보 및 AI 분석 요약 JSON 컬럼 추가 및 Storage 구성 마이그레이션
-- 작성일: 2026년 7월 5일
-- 설명: 기획, 구매, 입찰 문서의 물리적 파일 메타데이터 및 AI 분석 JSON 객체를 저장하기 위한 스키마 확장 SQL입니다.

-- 1. equipments 테이블 컬럼 추가
-- 기존 기자재 테이블에 기획, 구매, 입찰 문서의 물리적 파일 메타데이터 및 AI 분석 JSON 객체를 저장하기 위한 컬럼들을 신설합니다.
ALTER TABLE equipments
  ADD COLUMN IF NOT EXISTS doc_plan_file_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_plan_file_size BIGINT,
  ADD COLUMN IF NOT EXISTS doc_plan_file_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_purchase_file_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_purchase_file_size BIGINT,
  ADD COLUMN IF NOT EXISTS doc_purchase_file_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_bid_file_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_bid_file_size BIGINT,
  ADD COLUMN IF NOT EXISTS doc_bid_file_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_proposal_data JSONB,
  ADD COLUMN IF NOT EXISTS ai_purchase_data JSONB,
  ADD COLUMN IF NOT EXISTS ai_bid_data JSONB;

COMMENT ON COLUMN equipments.doc_plan_file_name IS '기획단계 첨부파일명';
COMMENT ON COLUMN equipments.doc_plan_file_size IS '기획단계 첨부파일 크기 (바이트)';
COMMENT ON COLUMN equipments.doc_plan_file_url IS '기획단계 Supabase Storage 파일 다운로드 URL';
COMMENT ON COLUMN equipments.ai_proposal_data IS '기획단계 GPT AI 요약 데이터 (결재번호, 주관부서, 목표 등)';

COMMENT ON COLUMN equipments.doc_purchase_file_name IS '구매단계 첨부파일명';
COMMENT ON COLUMN equipments.doc_purchase_file_size IS '구매단계 첨부파일 크기 (바이트)';
COMMENT ON COLUMN equipments.doc_purchase_file_url IS '구매단계 Supabase Storage 파일 다운로드 URL';
COMMENT ON COLUMN equipments.ai_purchase_data IS '구매단계 GPT AI 요약 데이터 (조달 기술 규격 등)';

COMMENT ON COLUMN equipments.doc_bid_file_name IS '입찰단계 첨부파일명';
COMMENT ON COLUMN equipments.doc_bid_file_size IS '입찰단계 첨부파일 크기 (바이트)';
COMMENT ON COLUMN equipments.doc_bid_file_url IS '입찰단계 Supabase Storage 파일 다운로드 URL';
COMMENT ON COLUMN equipments.ai_bid_data IS '입찰단계 GPT AI 요약 데이터 (입찰 자격, 기한 등)';


-- 2. Supabase Storage 버킷 생성
-- 기자재 조달 문서 파일을 보관하기 위한 'procurement-docs' Storage 버킷을 생성합니다.
-- public 속성을 true로 지정하여 토큰 없는 다운로드 및 확인이 가능하게 설정합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('procurement-docs', 'procurement-docs', true)
ON CONFLICT (id) DO NOTHING;


-- 3. Storage 버킷 RLS (Row Level Security) 정책 수립
-- 앵커사업단 관리자 및 인증된 사용자만 파일 업로드 및 삭제가 가능하도록 강력한 보안 정책을 정의합니다.
-- (누구나 파일을 다운로드할 수 있도록 SELECT 정책은 전체 허용으로 구성합니다.)

-- 기존에 동일한 정책명이 존재할 수 있으므로 삭제 후 신규 생성합니다.
DROP POLICY IF EXISTS "기자재 문서 누구나 다운로드 가능" ON storage.objects;
CREATE POLICY "기자재 문서 누구나 다운로드 가능"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'procurement-docs');

DROP POLICY IF EXISTS "인증된 임직원만 기자재 문서 업로드 가능" ON storage.objects;
CREATE POLICY "인증된 임직원만 기자재 문서 업로드 가능"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'procurement-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "인증된 임직원만 기자재 문서 삭제 가능" ON storage.objects;
CREATE POLICY "인증된 임직원만 기자재 문서 삭제 가능"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'procurement-docs' AND auth.role() = 'authenticated');
