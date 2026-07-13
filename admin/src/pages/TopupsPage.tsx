import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PhieuTopup } from '@main/types/wallet';
import { approveTopup, fetchAllTopups } from '@/lib/wallet';
import { TOPUP_PROVENANCE_OPTIONS, TOPUP_STATUS_OPTIONS } from '@/lib/badges';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const STATUS_COLOR = Object.fromEntries(TOPUP_STATUS_OPTIONS.map((o) => [o.value, o.color]));
const PROVENANCE_COLOR = Object.fromEntries(TOPUP_PROVENANCE_OPTIONS.map((o) => [o.value, o.color]));

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function TopupsPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [topups, setTopups] = useState<PhieuTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchAllTopups()
      .then(setTopups)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load top-ups'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredTopups = useMemo(
    () => topups.filter((topup) => statusFilter === 'All' || topup.status === statusFilter),
    [topups, statusFilter]
  );

  async function handleApprove(topup: PhieuTopup) {
    const confirmed = await confirm({
      title: 'Approve this top-up?',
      message: `Credits ${topup.phieuAmount} phiếu to the user's balance.`,
    });
    if (!confirmed) return;

    setApprovingId(topup.id);
    try {
      await approveTopup(topup.id);
      setTopups((current) => current.map((t) => (t.id === topup.id ? { ...t, status: 'approved' } : t)));
      showToast(`Approved top-up (+${topup.phieuAmount} phiếu)`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve top-up', 'error');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${filteredTopups.length} of ${topups.length} top-ups`}
        </p>
        <BadgeSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'All' }, ...TOPUP_STATUS_OPTIONS]} />
      </div>

      {loading ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : filteredTopups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No top-ups</p>
          <p className="mt-1 text-sm text-muted">Requests submitted from the wallet page will show up here.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:p-5">
          <div className="flex flex-col gap-2">
            {filteredTopups.map((topup) => (
              <div key={topup.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-elevated/50 p-3">
                {topup.paymentProofUrl ? (
                  <a href={topup.paymentProofUrl} target="_blank" rel="noreferrer" className="h-10 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
                    <img src={topup.paymentProofUrl} alt="" className="h-full w-full object-cover" />
                  </a>
                ) : (
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-[9px] font-semibold text-subtle">
                    No proof
                  </div>
                )}
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-semibold text-foreground">{topup.phieuAmount} phiếu — {formatVnd(topup.amountVnd)}</p>
                  <p className="text-xs text-subtle">{new Date(topup.createdAt).toLocaleString('en-US')}</p>
                </div>
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
                <div className="ml-auto flex items-center gap-2">
                  {topup.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(topup)}
                      disabled={approvingId === topup.id}
                      className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  <Link
                    to={`/topups/${topup.id}`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-elevated"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
