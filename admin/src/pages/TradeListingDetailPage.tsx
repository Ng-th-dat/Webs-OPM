import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { TradeListing } from '@main/types/tradeListing';
import { approveTradeListing, fetchTradeListingById, rejectTradeListing } from '@/lib/tradeListings';
import { SERVER_OPTIONS, TRADE_STATUS_OPTIONS } from '@/lib/badges';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

const STATUS_COLOR = Object.fromEntries(TRADE_STATUS_OPTIONS.map((o) => [o.value, o.color]));
const SERVER_COLOR = Object.fromEntries(SERVER_OPTIONS.map((o) => [o.value, o.color]));

export function TradeListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const [listing, setListing] = useState<TradeListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchTradeListingById(id)
      .then((data) => {
        if (!data) {
          setLoadError(`No listing found for "${id}"`);
          return;
        }
        setListing(data);
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    if (!listing) return;
    const confirmed = await confirm({
      title: 'Approve this listing?',
      message: `"${listing.title}" will become visible on the public Trade board.`,
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await approveTradeListing(listing.id);
      showToast(`Approved "${listing.title}"`, 'success');
      navigate('/trade-listings');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve listing', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!listing || !rejectReason.trim()) return;
    const confirmed = await confirm({
      title: 'Reject this listing?',
      message: `"${listing.title}" will be hidden from the public board. Reason: ${rejectReason.trim()}`,
      variant: 'danger',
      confirmLabel: 'Reject',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await rejectTradeListing(listing.id, rejectReason.trim());
      showToast(`Rejected "${listing.title}"`, 'success');
      navigate('/trade-listings');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject listing', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading listing…</p>;
  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;
  if (!listing) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <section className="ops-bracket rounded-card border border-border bg-surface p-6 shadow-elevated">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: SERVER_COLOR[listing.server] }}
            >
              {listing.server}
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: STATUS_COLOR[listing.status] }}
            >
              {listing.status}
            </span>
          </div>

          <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
          <p className="mt-1 text-lg font-bold text-accent">{listing.priceText}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{listing.description}</p>

          {listing.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {listing.images.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-xl border border-border transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <img src={url} alt="" className="h-32 w-full object-cover" />
                </a>
              ))}
            </div>
          )}

          <div className="mt-5 max-w-md rounded-xl border border-border bg-elevated/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Contact</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{listing.contactInfo}</p>
          </div>

          {listing.rejectionReason && (
            <div className="mt-3 max-w-md rounded-xl border border-danger/30 bg-danger/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-danger">Previous rejection reason</p>
              <p className="mt-1 text-sm text-foreground">{listing.rejectionReason}</p>
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          {listing.status === 'pending' ? (
            <section className="rounded-card border border-border bg-surface p-5 shadow-elevated">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Moderation</p>

              {!showRejectForm ? (
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={submitting}
                    className={buttonClasses('primary', 'md')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    disabled={submitting}
                    className={buttonClasses('ghost-danger', 'md')}
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
                      placeholder="Explain why this listing is being rejected — shown to the poster."
                      className="min-h-[5rem] w-full rounded-xl border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </label>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={submitting || !rejectReason.trim()}
                      className={buttonClasses('danger', 'md')}
                    >
                      Confirm rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason('');
                      }}
                      className={buttonClasses('ghost', 'md')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-card border border-border bg-surface p-5 shadow-elevated">
              <p className="text-[10px] font-bold uppercase tracking-widest text-subtle">Moderation</p>
              <p className="mt-2 text-sm text-muted">This listing has already been {listing.status}.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
