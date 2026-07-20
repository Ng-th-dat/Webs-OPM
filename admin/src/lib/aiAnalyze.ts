import { supabase } from './supabase';

export interface AnalyzedUpdateInfo {
  title: string;
  description: string;
  category: 'Update' | 'Event' | 'CnNews' | 'Maintenance';
  server: 'SEA' | 'CN' | 'Global' | 'Unknown';
  date: string;
  events: { title: string; note: string; startDate: string; endDate: string }[];
}

/**
 * Sends an already-uploaded banner image URL to the `analyze-update-image` Supabase Edge
 * Function, which calls the Anthropic API server-side (API key never reaches the browser)
 * and returns structured fields for the admin to review before publishing.
 */
export async function analyzeUpdateImage(imageUrl: string): Promise<AnalyzedUpdateInfo> {
  const { data, error } = await supabase.functions.invoke<{ result: AnalyzedUpdateInfo }>('analyze-update-image', {
    body: { imageUrl },
  });
  if (error) throw error;
  if (!data?.result) throw new Error('AI analysis returned no result');
  return data.result;
}
