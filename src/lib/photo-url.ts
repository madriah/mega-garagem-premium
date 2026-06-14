import { supabase } from "@/integrations/supabase/client";

const BUCKET = "vehicle-photos";
const EXPIRES = 60 * 60 * 24; // 24h

/** Extract the storage path from either a full URL or a raw path. */
export function toPath(value: string): string {
  if (!value) return "";
  const marker = `/${BUCKET}/`;
  const i = value.indexOf(marker);
  if (i >= 0) return value.slice(i + marker.length);
  return value;
}

/** Resolve a stored value (path or legacy URL) to a usable signed URL. */
export async function signPhoto(value: string): Promise<string> {
  const path = toPath(value);
  if (!path) return "";
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, EXPIRES);
  return data?.signedUrl ?? "";
}

export async function signPhotos(values: string[]): Promise<string[]> {
  if (!values?.length) return [];
  const paths = values.map(toPath).filter(Boolean);
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, EXPIRES);
  return (data ?? []).map((d) => d.signedUrl ?? "");
}
