import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TradeListing } from '@main/types/tradeListing';
import { approveTradeListing, fetchAllTradeListings } from '@/lib/tradeListings';
import { SERVER_OPTIONS, TRADE_STATUS_OPTIONS } from '@/lib/badges';
import { BadgeSelect } from '@/components/BadgeSelect';
import { ImageIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const STATUS_COLOR = Object.fromEntries(TRADE_STATUS_OPTIONS.map((o) => [o.value, o.color]));
const SERVER_COLOR = Object.fromEntries(SERVER_OPTIONS.map((o) => [o.value, o.color]));

function ListingThumb({ listing }: { listing: TradeListing }) {
  const [hasError, setHasError] = useState(false);

  if (!listing.images[0] || hasError) {
    return (
      <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-elevated text-subtle">
        <ImageIcon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={listing.images[0]}
      alt=""
      onError={() => setHasError(true)}
      className="h-10 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
    />
  );
}

export function TradeListingsPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchAllTradeListings()
      .then(setListings)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredListings = useMemo(
    () => listings.filter((listing) => statusFilter === 'All' || listing.status === statusFilter),
    [listings, statusFilter]
  );

  async function handleApprove(listing: TradeListing) {
    const confirmed = await confirm({
      title: 'Approve this listing?',
      message: `"${listing.title}" will become visible on the public Trade board.`,
    });
    if (!confirmed) return;

    setApprovingId(listing.id);
    try {
      await approveTradeListing(listing.id);
      setListings((current) => current.map((l) => (l.id === listing.id ? { ...l, status: 'approved' } : l)));
      showToast(`Approved "${listing.title}"`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve listing', 'error');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${filteredListings.length} of ${listings.length} listings`}
        </p>
        <BadgeSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: 'All' }, ...TRADE_STATUS_OPTIONS]}
        />
      </div>

      {loading ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No listings</p>
          <p className="mt-1 text-sm text-muted">Listings submitted by users will show up here for review.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:p-5">
          <div className="flex flex-col gap-2">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-elevated/50 p-3">
                <ListingThumb listing={listing} />
                <div className="min-w-[10rem] flex-1">
                  <Link to={`/trade-listings/${listing.id}`} className="text-sm font-semibold text-foreground hover:text-accent">
                    {listing.title}
                  </Link>
                  <p className="text-xs text-subtle">{listing.priceText}</p>
                </div>
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
                <div className="ml-auto flex items-center gap-2">
                  {listing.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(listing)}
                      disabled={approvingId === listing.id}
                      className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  <Link
                    to={`/trade-listings/${listing.id}`}
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
