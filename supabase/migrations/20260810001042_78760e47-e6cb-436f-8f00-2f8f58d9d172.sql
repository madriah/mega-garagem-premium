DROP POLICY IF EXISTS "Staff can read credit doc" ON storage.objects;
CREATE POLICY "Staff can read credit doc" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'credit-docs' AND EXISTS (
    SELECT 1 FROM public.credit_applications a
    WHERE (storage.foldername(objects.name))[1] = a.id::text
  )
);