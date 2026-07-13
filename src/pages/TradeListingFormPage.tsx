import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Server } from '@/types/releaseSchedule';
import { useAuth } from '@/hooks/useAuth';
import { useTradeListing } from '@/hooks/useTradeListing';
import { usePhieuBalance } from '@/hooks/usePhieuBalance';
import { createTradeListing, updateTradeListing } from '@/lib/api/tradeListings';
import { uploadTradeListingImage } from '@/lib/tradeListingImageStorage';
import { SERVER_LABEL_KEYS } from '@/utils/releaseSchedule';
import { TRADE_LISTING_FEE_PHIEU } from '@/utils/tradeListings';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ImageIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

const inputClasses =
  'h-12 w-full rounded-lg border border-border bg-elevated px-4 text-base text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-accent-info/60 focus:outline-none';

const SERVERS: Server[] = ['CN', 'SEA', 'Global'];
const MAX_IMAGES = 5;

export function TradeListingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { listing, loading: loadingListing } = useTradeListing(id);
  const { balance, loading: loadingBalance } = usePhieuBalance(user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draftId] = useState(() => crypto.randomUUID());
  const listingId = id ?? draftId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [server, setServer] = useState<Server>('SEA');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setPriceText(listing.priceText);
    setServer(listing.server);
    setContactInfo(listing.contactInfo);
    setImages(listing.images);
  }, [listing]);

  if (!user) return null;

  if (isEditMode && loadingListing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <LoadingState label={t('common.loading')} />
      </div>
    );
  }

  if (isEditMode && listing && listing.userId !== user.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <EmptyState title={t('common.errorTitle')} description={t('common.errorDescription')} />
      </div>
    );
  }

  const insufficientBalance = !isEditMode && !loadingBalance && balance < TRADE_LISTING_FEE_PHIEU;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadTradeListingImage(user.id, listingId, images.length, file);
      setImages((current) => [...current, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    if (!agreedToDisclaimer) {
      setError(t('common.errorTitle'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const input = {
      title: title.trim(),
      description: description.trim(),
      priceText: priceText.trim(),
      server,
      contactInfo: contactInfo.trim(),
      images,
    };

    try {
      if (isEditMode && id) {
        await updateTradeListing(id, input);
        navigate('/trade/mine');
      } else {
        await createTradeListing(draftId, user.id, input);
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <EmptyState title={t('trade.form.newTitle')} description={t('trade.form.submitNotice')} />
        <div className="mt-6 flex justify-center">
          <Link to="/trade/mine" className="text-sm font-semibold text-accent-info hover:underline">
            {t('trade.mine.title')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader
        title={t(isEditMode ? 'trade.form.editTitle' : 'trade.form.newTitle')}
        description={t('trade.form.description')}
      />

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 rounded-card border border-border bg-surface p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.form.titleLabel')}</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('trade.form.titlePlaceholder')}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.descriptionLabel')}</span>
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('trade.form.descriptionPlaceholder')}
            className={`${inputClasses} h-auto min-h-[7rem] resize-y py-3`}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.priceLabel')}</span>
            <input
              required
              value={priceText}
              onChange={(event) => setPriceText(event.target.value)}
              placeholder={t('trade.form.pricePlaceholder')}
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.serverLabel')}</span>
            <select value={server} onChange={(event) => setServer(event.target.value as Server)} className={inputClasses}>
              {SERVERS.map((option) => (
                <option key={option} value={option}>
                  {t(SERVER_LABEL_KEYS[option])}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.contactLabel')}</span>
          <input
            required
            value={contactInfo}
            onChange={(event) => setContactInfo(event.target.value)}
            placeholder={t('trade.form.contactPlaceholder')}
            className={inputClasses}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('trade.form.imagesLabel')}</span>
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-[10px] font-semibold text-white"
                >
                  {t('trade.form.removeImage')}
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-subtle transition-colors hover:border-accent-info/40 hover:text-foreground disabled:opacity-50"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">
                  {uploading ? t('common.loading') : t('trade.form.addImage')}
                </span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {!isEditMode && (
          <div
            className={`rounded-card border p-4 text-sm ${
              insufficientBalance ? 'border-danger/30 bg-danger/5' : 'border-accent-secondary/30 bg-accent-secondary/5'
            }`}
          >
            <p className={insufficientBalance ? 'text-danger' : 'text-muted'}>
              {t('trade.form.feeNotice', { fee: TRADE_LISTING_FEE_PHIEU, balance: loadingBalance ? '…' : balance })}
            </p>
            {insufficientBalance && (
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-semibold text-danger">{t('trade.form.insufficientBalance')}</span>
                <Link
                  to="/wallet"
                  className="shrink-0 rounded-full bg-accent-info px-4 py-1.5 text-xs font-bold text-canvas transition-opacity hover:opacity-90"
                >
                  {t('wallet.topUpNow')}
                </Link>
              </div>
            )}
          </div>
        )}

        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={agreedToDisclaimer}
            onChange={(event) => setAgreedToDisclaimer(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>
            {t('trade.form.agreeDisclaimer')}{' '}
            <Link to="/trade/disclaimer" target="_blank" className="font-semibold text-accent-info hover:underline">
              {t('trade.form.disclaimerLinkText')}
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !agreedToDisclaimer || insufficientBalance}
          className="h-12 rounded-lg bg-accent-info text-sm font-bold text-canvas transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t('trade.form.submitting') : t(isEditMode ? 'trade.form.submitEdit' : 'trade.form.submit')}
        </button>
      </form>
    </section>
  );
}
