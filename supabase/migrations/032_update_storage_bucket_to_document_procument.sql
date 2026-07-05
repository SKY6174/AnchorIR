-- ⚓ [032] Supabase Storage 버킷 document_procument 구성 및 RLS 보안 정책 마이그레이션
-- 작성일: 2026년 7월 5일
-- 설명: 조달 관련 모든 문서(환경개선, 기자재구매, 용역)를 관리하는 통합 버킷인 'document_procument'를 생성하고 RLS 정책을 구성합니다.

-- 1. Supabase Storage 버킷 생성
-- public 속성을 true로 지정하여 공인 다운로드가 가능하게 설정합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('document_procument', 'document_procument', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage 버킷 RLS (Row Level Security) 정책 수립
-- 앵커사업단 관리자 및 인증된 사용자(임직원)만 파일 업로드 및 삭제가 가능하도록 강력한 보안 정책을 정의합니다.
-- SELECT 정책은 전체 허용으로 구성하여 다운로드는 누구나 가능하게 제어합니다.

-- 기존에 동일한 정책명이 존재할 수 있으므로 안전하게 삭제 후 신규 생성합니다.
DROP POLICY IF EXISTS "조달 문서 누구나 다운로드 가능" ON storage.objects;
CREATE POLICY "조달 문서 누구나 다운로드 가능"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document_procument');

DROP POLICY IF EXISTS "인증된 임직원만 조달 문서 업로드 가능" ON storage.objects;
CREATE POLICY "인증된 임직원만 조달 문서 업로드 가능"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document_procument' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "인증된 임직원만 조달 문서 삭제 가능" ON storage.objects;
CREATE POLICY "인증된 임직원만 조달 문서 삭제 가능"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'document_procument' AND auth.role() = 'authenticated');
