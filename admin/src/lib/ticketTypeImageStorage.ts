import { supabase } from '@/lib/supabase';

const BUCKET = 'ticket-source-images';

/**
 * Uploads to `<ticketType>.<ext>` with upsert — one icon per ticket type (black/STK/topup), shared
 * across every source of that type, not per individual source.
 */
export async function uploadTicketTypeImage(ticketType: 'black' | 'stk' | 'topup', file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${ticketType}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
