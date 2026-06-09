
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- Storage policies for vehicle-photos
CREATE POLICY "Public read vehicle photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');
CREATE POLICY "Owner upload vehicle photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update vehicle photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete vehicle photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
