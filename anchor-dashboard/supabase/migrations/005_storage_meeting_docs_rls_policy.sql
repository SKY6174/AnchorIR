-- ==============================================================================
-- 💡 Supabase Storage meeting_docs 버킷 익명 및 인증 사용자 업로드/조회 RLS 정책 허용 SQL
-- ==============================================================================

-- 1. meeting_docs 버킷 공개(Public) 설정 확인 및 적용
UPDATE storage.buckets
SET public = true
WHERE id = 'meeting_docs';

-- 2. 기존 정책 충돌 방지 및 신규 RLS 정책 생성 (INSERT, SELECT, UPDATE, DELETE 100% 허용)
DROP POLICY IF EXISTS "Allow public upload for meeting_docs" ON storage.objects;

CREATE POLICY "Allow public upload for meeting_docs"
ON storage.objects
FOR ALL
TO anon, authenticated
USING (bucket_id = 'meeting_docs')
WITH CHECK (bucket_id = 'meeting_docs');
