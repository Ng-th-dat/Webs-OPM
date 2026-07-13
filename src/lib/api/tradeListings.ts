import { supabase } from '@/lib/supabase';
import type { Server } from '@/types/releaseSchedule';
import type { TradeListing, TradeListingInput, TradeListingStatus } from '@/types/tradeListing';

interface TradeListingRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_text: string;
  server: Server;
  contact_info: string;
  images: string[];
  status: TradeListingStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToListing(row: TradeListingRow): TradeListing {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    priceText: row.price_text,
    server: row.server,
    contactInfo: row.contact_info,
    images: row.images,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TradeListingFilters {
  server?: Server;
}

export async function fetchApprovedTradeListings(filters?: TradeListingFilters): Promise<TradeListing[]> {
  let query = supabase.from('trade_listings').select('*').eq('status', 'approved').order('created_at', { ascending: false });
  if (filters?.server) {
    query = query.eq('server', filters.server);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as TradeListingRow[]).map(mapRowToListing);
}

export async function fetchTradeListingById(id: string): Promise<TradeListing | null> {
  const { data, error } = await supabase.from('trade_listings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToListing(data as TradeListingRow) : null;
}

export async function fetchMyTradeListings(userId: string): Promise<TradeListing[]> {
  const { data, error } = await supabase
    .from('trade_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TradeListingRow[]).map(mapRowToListing);
}

export async function createTradeListing(id: string, userId: string, input: TradeListingInput): Promise<void> {
  const { error } = await supabase.from('trade_listings').insert({
    id,
    user_id: userId,
    title: input.title,
    description: input.description,
    price_text: input.priceText,
    server: input.server,
    contact_info: input.contactInfo,
    images: input.images,
  });
  if (error) throw error;
}

// Only sends content fields — never touches `status`, so the DB trigger can decide
// whether an edit needs to reset an approved listing back to pending (see
// enforce_trade_listing_transitions() in 0009_create_trade_listings.sql).
export async function updateTradeListing(id: string, input: TradeListingInput): Promise<void> {
  const { error } = await supabase
    .from('trade_listings')
    .update({
      title: input.title,
      description: input.description,
      price_text: input.priceText,
      server: input.server,
      contact_info: input.contactInfo,
      images: input.images,
    })
    .eq('id', id);
  if (error) throw error;
}

// Sends only `status` — the trigger allows this exact shape (status-only change,
// approved -> sold) as the one self-service transition a seller has.
export async function markTradeListingSold(id: string): Promise<void> {
  const { error } = await supabase.from('trade_listings').update({ status: 'sold' }).eq('id', id);
  if (error) throw error;
}

export async function deleteTradeListing(id: string): Promise<void> {
  const { error } = await supabase.from('trade_listings').delete().eq('id', id);
  if (error) throw error;
}
