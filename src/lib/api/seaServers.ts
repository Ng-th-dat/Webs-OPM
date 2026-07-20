import { supabase } from '@/lib/supabase';
import type { SeaServerEntry } from '@/types/seaServer';

interface SeaServerRow {
  id: string;
  server_label: string;
  open_date: string;
  created_at: string;
  updated_at: string;
}

function mapRowToEntry(row: SeaServerRow): SeaServerEntry {
  return {
    id: row.id,
    serverLabel: row.server_label,
    openDate: row.open_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchSeaServers(): Promise<SeaServerEntry[]> {
  const { data, error } = await supabase.from('sea_new_servers').select('*').order('open_date', { ascending: false });

  if (error) throw error;
  return (data as SeaServerRow[]).map(mapRowToEntry);
}
