import { supabase } from '@/lib/supabase';

const BUCKET = 'character-images';

/**
 * Uploads to `<slug>/<slot>.<ext>` with upsert so re-uploading the same slot
 * (e.g. re-picking a portrait) replaces the file instead of erroring or orphaning it.
 */
export async function uploadCharacterImage(slug: string, slot: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${slug}/${slot}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Storage objects are served with a long cache-control header, and upsert keeps the same
  // path — without a cache-busting param, a replace re-uses the same URL the browser (and the
  // main site) already cached, so the old image keeps showing.
  return `${data.publicUrl}?v=${Date.now()}`;
}
