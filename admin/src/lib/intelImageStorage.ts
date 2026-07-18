import { supabase } from './supabase';

const BUCKET = 'intel-images';

/**
 * Uploads to `<draftKey>/<slot>.<ext>` with upsert — slot is `cover` or `hint-<index>`, one
 * image per slot. Mirrors uploadUpdateImage's draft-folder pattern (images upload before the
 * dossier row exists).
 */
export async function uploadIntelImage(draftKey: string, slot: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${draftKey}/${slot}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
