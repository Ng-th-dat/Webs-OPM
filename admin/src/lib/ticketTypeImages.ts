import { supabase } from '@/lib/supabase';

interface TicketTypeImageRow {
  ticket_type: string;
  image_url: string | null;
}

export async function fetchTicketTypeImages(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('ticket_type_images').select('ticket_type, image_url');
  if (error) throw error;

  const images: Record<string, string> = {};
  for (const row of data as TicketTypeImageRow[]) {
    if (row.image_url) images[row.ticket_type] = row.image_url;
  }
  return images;
}

export async function setTicketTypeImage(ticketType: 'black' | 'stk', imageUrl: string): Promise<void> {
  const { error } = await supabase
    .from('ticket_type_images')
    .upsert({ ticket_type: ticketType, image_url: imageUrl, updated_at: new Date().toISOString() });
  if (error) throw error;
}
