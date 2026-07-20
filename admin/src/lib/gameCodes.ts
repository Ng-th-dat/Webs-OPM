import { supabase } from '@/lib/supabase';
import type { GameCodeEntry, GameCodeStatus } from '@main/types/gameCode';

interface GameCodeRow {
  id: string;
  code: string;
  status: GameCodeStatus;
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

/** Admin sees every code, active and expired alike — the public site is the one that filters. */
export async function fetchGameCodes(): Promise<GameCodeEntry[]> {
  const { data, error } = await supabase.from('game_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as GameCodeRow[]).map(mapRowToEntry);
}

export async function fetchGameCodeById(id: string): Promise<GameCodeEntry | null> {
  const { data, error } = await supabase.from('game_codes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToEntry(data as GameCodeRow) : null;
}

export interface GameCodeInput {
  code: string;
  status: GameCodeStatus;
}

function toRow(input: GameCodeInput) {
  return {
    code: input.code,
    status: input.status,
  };
}

export async function createGameCode(input: GameCodeInput): Promise<void> {
  const { error } = await supabase.from('game_codes').insert({ id: crypto.randomUUID(), ...toRow(input) });
  if (error) throw error;
}

export async function updateGameCode(id: string, input: GameCodeInput): Promise<void> {
  const { error } = await supabase.from('game_codes').update(toRow(input)).eq('id', id);
  if (error) throw error;
}

export async function deleteGameCode(id: string): Promise<void> {
  const { error } = await supabase.from('game_codes').delete().eq('id', id);
  if (error) throw error;
}
