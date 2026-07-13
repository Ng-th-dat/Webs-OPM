import { supabase } from '@/lib/supabase';
import type { Server } from '@main/types/releaseSchedule';
import type { TradeListing, TradeListingStatus } from '@main/types/tradeListing';

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

export async function fetchAllTradeListings(): Promise<TradeListing[]> {
  const { data, error } = await supabase.from('trade_listings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TradeListingRow[]).map(mapRowToListing);
}

export async function fetchTradeListingById(id: string): Promise<TradeListing | null> {
  const { data, error } = await supabase.from('trade_listings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToListing(data as TradeListingRow) : null;
}

export async function approveTradeListing(id: string): Promise<void> {
  const { error } = await supabase.from('trade_listings').update({ status: 'approved', rejection_reason: null }).eq('id', id);
  if (error) throw error;
}

export async function rejectTradeListing(id: string, reason: string): Promise<void> {
  const { error } = await supabase.from('trade_listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
  if (error) throw error;
}
