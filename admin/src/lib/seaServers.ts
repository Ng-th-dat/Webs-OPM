import { supabase } from '@/lib/supabase';
import type { SeaServerEntry } from '@main/types/seaServer';

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

export async function fetchSeaServerById(id: string): Promise<SeaServerEntry | null> {
  const { data, error } = await supabase.from('sea_new_servers').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as SeaServerRow) : null;
}

export interface SeaServerInput {
  serverLabel: string;
  openDate: string;
}

function toRow(input: SeaServerInput) {
  return {
    server_label: input.serverLabel,
    open_date: input.openDate,
  };
}

export async function createSeaServer(input: SeaServerInput): Promise<void> {
  const { error } = await supabase.from('sea_new_servers').insert({ id: crypto.randomUUID(), ...toRow(input) });
  if (error) throw error;
}

export async function updateSeaServer(id: string, input: SeaServerInput): Promise<void> {
  const { error } = await supabase.from('sea_new_servers').update(toRow(input)).eq('id', id);
  if (error) throw error;
}

export async function deleteSeaServer(id: string): Promise<void> {
  const { error } = await supabase.from('sea_new_servers').delete().eq('id', id);
  if (error) throw error;
}
