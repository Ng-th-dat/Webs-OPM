import { supabase } from '@/lib/supabase';

const BUCKET = 'trade-listing-images';

/**
 * Uploads to `<userId>/<listingId>/<index>.<ext>` with upsert, matching the
 * uploadUpdateImage pattern — RLS on this bucket checks the first path segment
 * equals auth.uid(), so listingId being a client-generated draft id (created before
 * the row exists) works the same way UpdateFormPage's draftId does.
 */
export async function uploadTradeListingImage(userId: string, listingId: string, index: number, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${listingId}/${index}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
