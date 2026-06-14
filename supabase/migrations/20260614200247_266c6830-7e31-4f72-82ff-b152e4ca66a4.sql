CREATE POLICY "Public can read vehicle-photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'vehicle-photos');

CREATE POLICY "Owners can upload to vehicle-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete their vehicle-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);