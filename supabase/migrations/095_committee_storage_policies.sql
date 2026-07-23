-- Committee documents and signatures are private; only the Edge Function service role accesses them.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('committee-meeting-documents', 'committee-meeting-documents', false, 20971520, ARRAY['application/pdf']),
  ('committee-signatures', 'committee-signatures', false, 2097152, ARRAY['image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- No anon/authenticated storage.objects policies are created. Signed URLs are issued by the Edge Function.
NOTIFY pgrst, 'reload schema';
