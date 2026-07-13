import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PhieuTopup } from '@main/types/wallet';
import { approveTopup, fetchTopupById, rejectTopup } from '@/lib/wallet';
import { TOPUP_PROVENANCE_OPTIONS, TOPUP_STATUS_OPTIONS } from '@/lib/badges';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const STATUS_COLOR = Object.fromEntries(TOPUP_STATUS_OPTIONS.map((o) => [o.value, o.color]));
const PROVENANCE_COLOR = Object.fromEntries(TOPUP_PROVENANCE_OPTIONS.map((o) => [o.value, o.color]));

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function TopupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const [topup, setTopup] = useState<PhieuTopup | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchTopupById(id)
      .then((data) => {
        if (!data) {
          setLoadError(`No top-up found for "${id}"`);
          return;
        }
        setTopup(data);
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load top-up'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    if (!topup) return;
    const confirmed = await confirm({
      title: 'Approve this top-up?',
      message: `Credits ${topup.phieuAmount} phiếu to the user's balance.`,
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await approveTopup(topup.id);
      showToast(`Approved top-up (+${topup.phieuAmount} phiếu)`, 'success');
      navigate('/topups');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve top-up', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!topup || !rejectReason.trim()) return;
    const confirmed = await confirm({
      title: 'Reject this top-up?',
      message: `No balance will be credited. Reason: ${rejectReason.trim()}`,
      variant: 'danger',
      confirmLabel: 'Reject',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await rejectTopup(topup.id, rejectReason.trim());
      showToast('Rejected top-up', 'success');
      navigate('/topups');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject top-up', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading top-up…</p>;
  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;
  if (!topup) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-elevated">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: STATUS_COLOR[topup.status] }}
          >
            {topup.status}
          </span>
          {topup.status === 'approved' && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: topup.autoMatched ? PROVENANCE_COLOR.Auto : PROVENANCE_COLOR.Manual }}
            >
              {topup.autoMatched ? 'Auto' : 'Manual'}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-xl font-bold text-foreground">
          {topup.phieuAmount} phiếu — {formatVnd(topup.amountVnd)}
        </h1>
        <p className="mt-1 text-sm text-subtle">{new Date(topup.createdAt).toLocaleString('en-US')}</p>
        <p className="mt-1 text-xs text-muted">
          Transfer code: <span className="font-mono">{topup.transferCode}</span>
          {topup.sepayTransactionId && (
            <>
              {' '}
              · SePay txn: <span className="font-mono">{topup.sepayTransactionId}</span>
            </>
          )}
        </p>

        {topup.paymentProofUrl ? (
          <a href={topup.paymentProofUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block overflow-hidden rounded-xl border border-border">
            <img src={topup.paymentProofUrl} alt="" className="h-64 w-auto object-cover" />
          </a>
        ) : (
          <p className="mt-5 text-sm text-subtle">No payment screenshot submitted for this top-up.</p>
        )}

        {topup.rejectionReason && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">Previous rejection reason</p>
            <p className="mt-1 text-sm text-foreground">{topup.rejectionReason}</p>
          </div>
        )}
      </section>

      {topup.status === 'pending' && (
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-elevated">
          <h2 className="text-sm font-bold text-foreground">Moderation</h2>

          {!showRejectForm ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-hover))] px-5 py-2.5 text-sm font-bold text-white shadow-glow-accent transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={submitting}
                className="rounded-full border border-danger/30 px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Rejection reason</span>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explain why this top-up is being rejected — e.g. amount mismatch, no transfer found."
                  className="min-h-[5rem] w-full rounded-xl border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="rounded-full bg-[linear-gradient(135deg,var(--color-danger),#b91c1c)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
