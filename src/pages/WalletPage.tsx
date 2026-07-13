import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePhieuBalance } from '@/hooks/usePhieuBalance';
import { useMyTopups } from '@/hooks/useMyTopups';
import { cancelTopupRequest, createTopupRequest } from '@/lib/api/wallet';
import { buildVietQrUrl, DONATE_ACCOUNT_HOLDER, DONATE_ACCOUNT_NUMBER } from '@/utils/donate';
import { PHIEU_PACKAGES, TOPUP_STATUS_LABEL_KEYS, TOPUP_STATUS_STYLES, formatVnd } from '@/utils/wallet';
import { TRADE_LISTING_FEE_PHIEU, formatTradeListingDate } from '@/utils/tradeListings';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { CheckIcon, CopyIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function WalletPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [pollMs, setPollMs] = useState<number | undefined>(undefined);
  const { balance, loading: loadingBalance } = usePhieuBalance(user?.id, pollMs);
  const { topups, loading: loadingTopups, refetch: refetchTopups } = useMyTopups(user?.id, pollMs);

  useEffect(() => {
    const hasFreshPending = topups.some(
      (topup) => topup.status === 'pending' && Date.now() - new Date(topup.createdAt).getTime() < 15 * 60 * 1000
    );
    setPollMs(hasFreshPending ? 4000 : undefined);
  }, [topups]);

  const [draftId, setDraftId] = useState<string | null>(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [requestReady, setRequestReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (!user) return null;

  const selectedPackage = selectedPackageIndex !== null ? PHIEU_PACKAGES[selectedPackageIndex] : null;
  const transferCode = draftId ? draftId.slice(0, 8).toUpperCase() : null;
  const transferNote = transferCode ? `NAPPHIEU ${transferCode}` : null;
  const qrUrl =
    selectedPackage && transferNote ? buildVietQrUrl({ amount: selectedPackage.vnd, addInfo: transferNote }) : null;

  async function handleCopyAccount() {
    try {
      await navigator.clipboard.writeText(DONATE_ACCOUNT_NUMBER);
    } catch {
      return;
    }
    setCopiedAccount(true);
    window.setTimeout(() => setCopiedAccount(false), 2000);
  }

  // Confirms with the user first, then creates the phieu_topups row immediately —
  // before any money moves — so the transfer_code shown on screen already has a
  // matching pending row for the SePay webhook (or an admin, as a fallback) to
  // reconcile against once the user pays.
  async function handleSelectPackage(index: number) {
    if (!user) return;
    const pkg = PHIEU_PACKAGES[index];

    const confirmed = await confirm({
      title: t('wallet.confirmTitle'),
      message: t('wallet.confirmMessage', { phieu: pkg.phieu, amount: formatVnd(pkg.vnd) }),
      confirmLabel: t('wallet.confirmYes'),
      cancelLabel: t('wallet.confirmNo'),
    });
    if (!confirmed) return;

    const newDraftId = crypto.randomUUID();

    setSelectedPackageIndex(index);
    setDraftId(newDraftId);
    setError(null);
    setRequestReady(false);
    setCreatingRequest(true);
    try {
      await createTopupRequest(newDraftId, user.id, {
        phieuAmount: pkg.phieu,
        amountVnd: pkg.vnd,
        transferCode: newDraftId.slice(0, 8).toUpperCase(),
      });
      setRequestReady(true);
      refetchTopups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create top-up request');
    } finally {
      setCreatingRequest(false);
    }
  }

  // Real hard delete while still pending (see 0019_topup_owner_cancel.sql) — refetching
  // afterward makes the cancellation show up immediately with no manual refresh needed.
  async function handleCancel(id: string) {
    setCancellingId(id);
    setError(null);
    try {
      await cancelTopupRequest(id);
      if (id === draftId) {
        setSelectedPackageIndex(null);
        setDraftId(null);
        setRequestReady(false);
      }
      refetchTopups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel top-up request');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('wallet.title')} description={t('wallet.description', { fee: TRADE_LISTING_FEE_PHIEU })} />

      <div className="mt-8 rounded-card border border-border bg-surface p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('wallet.balanceLabel')}</span>
        <p className="mt-1 text-3xl font-extrabold text-accent-secondary">
          {loadingBalance ? '…' : balance} <span className="text-base font-semibold text-muted">{t('wallet.tokenUnit')}</span>
        </p>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-foreground">{t('wallet.buyTitle')}</h2>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PHIEU_PACKAGES.map((pkg, index) => (
            <button
              key={pkg.phieu}
              type="button"
              onClick={() => handleSelectPackage(index)}
              className={`rounded-lg border p-3 text-center transition-colors duration-200 ${
                selectedPackageIndex === index
                  ? 'border-accent-info bg-accent-info/10'
                  : 'border-border bg-elevated hover:border-accent-info/40'
              }`}
            >
              <p className="text-lg font-extrabold text-foreground">{pkg.phieu}</p>
              <p className="text-xs text-muted">{formatVnd(pkg.vnd)}</p>
            </button>
          ))}
        </div>

        {selectedPackage && qrUrl && (
          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row">
            <img
              src={qrUrl}
              alt={t('wallet.qrAlt', { holder: DONATE_ACCOUNT_HOLDER })}
              loading="lazy"
              className="h-36 w-36 shrink-0 self-center rounded-lg bg-white p-2 sm:self-start"
            />

            <div className="flex flex-1 flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas/60 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                    {t('wallet.accountHolderLabel')}
                  </span>
                  <span className="font-semibold text-foreground">{DONATE_ACCOUNT_HOLDER}</span>
                  <span className="font-mono text-xs text-muted">{DONATE_ACCOUNT_NUMBER}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  aria-label={t('wallet.copy')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-subtle transition-colors duration-200 hover:border-accent-secondary/50 hover:text-foreground"
                >
                  {copiedAccount ? <CheckIcon className="h-3.5 w-3.5 text-accent-secondary" /> : <CopyIcon className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-canvas/60 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">{t('trade.priceLabel')}</span>
                <span className="font-bold text-accent-secondary">{formatVnd(selectedPackage.vnd)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-canvas/60 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  {t('wallet.transferNoteLabel')}
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">{transferNote}</span>
              </div>

              <p className="text-xs text-accent-info">{t('wallet.autoCreditNotice')}</p>
              <p className="text-xs text-muted">{t('wallet.supportNotice')}</p>

              {error && <p className="text-sm text-danger">{error}</p>}

              <p className="text-sm font-semibold text-accent-info">
                {creatingRequest ? t('wallet.submitting') : requestReady ? t('wallet.submitNotice') : null}
              </p>

              {requestReady && draftId && (
                <button
                  type="button"
                  onClick={() => handleCancel(draftId)}
                  disabled={cancellingId === draftId}
                  className="mt-1 h-9 rounded-lg border border-border text-xs font-semibold text-muted transition-colors duration-200 hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingId === draftId ? t('wallet.cancelling') : t('wallet.cancelRequest')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-foreground">{t('wallet.historyTitle')}</h2>
        {loadingTopups ? (
          <LoadingState label={t('common.loading')} className="mt-3" />
        ) : topups.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t('wallet.historyEmpty')}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {topups.map((topup) => (
              <div key={topup.id} className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {topup.phieuAmount} {t('wallet.tokenUnit')} — {formatVnd(topup.amountVnd)}
                  </p>
                  <p className="text-xs text-subtle">{formatTradeListingDate(topup.createdAt, language)}</p>
                  {topup.status === 'rejected' && topup.rejectionReason && (
                    <p className="mt-1 text-xs text-danger">{topup.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TOPUP_STATUS_STYLES[topup.status]}`}
                  >
                    {t(TOPUP_STATUS_LABEL_KEYS[topup.status])}
                  </span>
                  {topup.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(topup.id)}
                      disabled={cancellingId === topup.id}
                      className="text-[10px] font-semibold text-muted underline-offset-2 transition-colors hover:text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === topup.id ? t('wallet.cancelling') : t('wallet.cancelRequest')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
