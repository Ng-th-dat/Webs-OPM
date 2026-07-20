import { supabase } from '@/lib/supabase';
import type { GameCodeEntry } from '@/types/gameCode';

interface GameCodeRow {
  id: string;
  code: string;
  status: 'active' | 'expired';
  created_at: string;
  updated_at: string;
}

function mapRowToEntry(row: GameCodeRow): GameCodeEntry {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Only ever fetches `active` codes — expired ones stay visible to the admin, never to the public site. */
export async function fetchGameCodes(): Promise<GameCodeEntry[]> {
  const { data, error } = await supabase
    .from('game_codes')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as GameCodeRow[]).map(mapRowToEntry);
}
