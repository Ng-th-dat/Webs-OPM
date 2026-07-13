export type PhieuTopupStatus = 'pending' | 'approved' | 'rejected';

export interface PhieuTopup {
  id: string;
  userId: string;
  phieuAmount: number;
  amountVnd: number;
  transferCode: string;
  paymentProofUrl: string | null;
  status: PhieuTopupStatus;
  autoMatched: boolean;
  sepayTransactionId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhieuTopupInput {
  phieuAmount: number;
  amountVnd: number;
  transferCode: string;
  paymentProofUrl?: string;
}
