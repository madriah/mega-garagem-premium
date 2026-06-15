
CREATE POLICY "Anyone can upload credit doc"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'credit-docs');

CREATE POLICY "Owner can read credit doc"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'credit-docs'
    AND EXISTS (
      SELECT 1 FROM public.credit_applications a
      WHERE a.user_id = auth.uid()
        AND (storage.foldername(name))[1] = a.id::text
    )
  );

CREATE POLICY "Owner can delete credit doc"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'credit-docs'
    AND EXISTS (
      SELECT 1 FROM public.credit_applications a
      WHERE a.user_id = auth.uid()
        AND (storage.foldername(name))[1] = a.id::text
    )
  );
