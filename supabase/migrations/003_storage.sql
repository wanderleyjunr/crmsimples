INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-avatars',
  'client-avatars',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'client-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'client-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
