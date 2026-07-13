export const MB_BANK_BIN = '970422';
export const DONATE_ACCOUNT_NUMBER = '7470102050000';
export const DONATE_ACCOUNT_HOLDER = 'NGUYEN THANH DAT';

interface VietQrOptions {
  amount?: number;
  addInfo?: string;
}

export function buildVietQrUrl({ amount, addInfo }: VietQrOptions = {}): string {
  const params = new URLSearchParams({ accountName: DONATE_ACCOUNT_HOLDER });
  if (amount) params.set('amount', String(amount));
  if (addInfo) params.set('addInfo', addInfo);
  return `https://img.vietqr.io/image/${MB_BANK_BIN}-${DONATE_ACCOUNT_NUMBER}-compact2.png?${params.toString()}`;
}
