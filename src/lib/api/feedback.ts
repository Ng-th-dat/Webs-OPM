import { supabase } from '@/lib/supabase';
import type { FeedbackInput } from '@/types/feedback';

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    id: crypto.randomUUID(),
    message: input.message,
    contact: input.contact || null,
  });
  if (error) throw error;
}
