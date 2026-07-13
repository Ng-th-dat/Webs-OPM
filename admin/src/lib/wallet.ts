import { supabase } from '@/lib/supabase';
import type { PhieuTopup, PhieuTopupStatus } from '@main/types/wallet';

interface TopupRow {
  id: string;
  user_id: string;
  phieu_amount: number;
  amount_vnd: number;
  transfer_code: string;
  payment_proof_url: string | null;
  status: PhieuTopupStatus;
  auto_matched: boolean;
  sepay_transaction_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToTopup(row: TopupRow): PhieuTopup {
  return {
    id: row.id,
    userId: row.user_id,
    phieuAmount: row.phieu_amount,
    amountVnd: row.amount_vnd,
    transferCode: row.transfer_code,
    paymentProofUrl: row.payment_proof_url,
    status: row.status,
    autoMatched: row.auto_matched,
    sepayTransactionId: row.sepay_transaction_id ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchAllTopups(): Promise<PhieuTopup[]> {
  const { data, error } = await supabase.from('phieu_topups').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TopupRow[]).map(mapRowToTopup);
}

export async function fetchTopupById(id: string): Promise<PhieuTopup | null> {
  const { data, error } = await supabase.from('phieu_topups').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToTopup(data as TopupRow) : null;
}

// Credits the user's phieu_balance and marks the topup approved in one atomic
// transaction — see approve_phieu_topup() in 0014_create_phieu_topups.sql.
export async function approveTopup(id: string): Promise<void> {
  const { error } = await supabase.rpc('approve_phieu_topup', { topup_id: id });
  if (error) throw error;
}

export async function rejectTopup(id: string, reason: string): Promise<void> {
  const { error } = await supabase.from('phieu_topups').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
  if (error) throw error;
}
