import { supabase } from './supabase';

const BUCKET = 'update-images';

/**
 * Uploads to `<slug>/banner.<ext>` with upsert so re-uploading (e.g. swapping the banner
 * before publishing) replaces the file instead of erroring or orphaning it.
 */
export async function uploadUpdateImage(slug: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${slug}/banner.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Cache-bust like uploadCharacterImage — upsert reuses the same path/URL, and Storage
  // objects are served with a long cache-control header, so a replace would otherwise
  // keep showing the previously-cached image.
  return `${data.publicUrl}?v=${Date.now()}`;
}
