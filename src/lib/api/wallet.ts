import { supabase } from '@/lib/supabase';
import type { PhieuTopup, PhieuTopupInput, PhieuTopupStatus } from '@/types/wallet';

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

export async function fetchMyPhieuBalance(userId: string): Promise<number> {
  const { data, error } = await supabase.from('profiles').select('phieu_balance').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.phieu_balance ?? 0;
}

export async function fetchMyTopups(userId: string): Promise<PhieuTopup[]> {
  const { data, error } = await supabase
    .from('phieu_topups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TopupRow[]).map(mapRowToTopup);
}

export async function createTopupRequest(id: string, userId: string, input: PhieuTopupInput): Promise<void> {
  const { error } = await supabase.from('phieu_topups').insert({
    id,
    user_id: userId,
    phieu_amount: input.phieuAmount,
    amount_vnd: input.amountVnd,
    transfer_code: input.transferCode,
    payment_proof_url: input.paymentProofUrl ?? null,
  });
  if (error) throw error;
}

// Real hard delete, only possible while status is still 'pending' — see
// 0019_topup_owner_cancel.sql. Once the webhook or an admin resolves the request, RLS
// no longer lets the owner touch the row at all.
export async function cancelTopupRequest(id: string): Promise<void> {
  const { error } = await supabase.from('phieu_topups').delete().eq('id', id);
  if (error) throw error;
}
