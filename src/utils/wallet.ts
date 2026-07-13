import type { PhieuTopupStatus } from '@/types/wallet';
import type { TranslationKey } from '@/i18n';

/** 1 phiếu = 1,000 VND. */
export const PHIEU_VALUE_VND = 1000;

export interface PhieuPackage {
  phieu: number;
  vnd: number;
}

export const PHIEU_PACKAGES: PhieuPackage[] = [5, 10, 20, 50].map((phieu) => ({
  phieu,
  vnd: phieu * PHIEU_VALUE_VND,
}));

export const TOPUP_STATUS_LABEL_KEYS: Record<PhieuTopupStatus, TranslationKey> = {
  pending: 'trade.status.pending',
  approved: 'trade.status.approved',
  rejected: 'trade.status.rejected',
};

export const TOPUP_STATUS_STYLES: Record<PhieuTopupStatus, string> = {
  pending: 'bg-accent-secondary text-canvas',
  approved: 'bg-rarity-r text-canvas',
  rejected: 'bg-accent text-canvas',
};

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}
