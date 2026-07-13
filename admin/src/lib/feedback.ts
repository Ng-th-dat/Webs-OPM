import { supabase } from '@/lib/supabase';
import type { FeedbackEntry } from '@main/types/feedback';

interface FeedbackRow {
  id: string;
  message: string;
  contact: string | null;
  created_at: string;
}

function mapRowToFeedback(row: FeedbackRow): FeedbackEntry {
  return {
    id: row.id,
    message: row.message,
    contact: row.contact ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchAllFeedback(): Promise<FeedbackEntry[]> {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as FeedbackRow[]).map(mapRowToFeedback);
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}
