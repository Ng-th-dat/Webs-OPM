import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useTicketTypeImages } from '@/hooks/useTicketTypeImages';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CoinIcon, SparklesIcon, TicketIcon, XIcon } from '@/components/common/icons';
import { TopupModal } from './TopupModal';

const BUTTON_SIZE_PX = 56;
const BOTTOM_MARGIN_PX = 20;
const TOP_CLEARANCE_PX = 100;
const DRAG_THRESHOLD_PX = 6;

const SLOGAN_VISIBLE_MS = 4500;
const SLOGAN_HIDDEN_MS = 7000;
const SLOGAN_INITIAL_DELAY_MS = 2000;

function defaultTop() {
  return window.innerHeight - BUTTON_SIZE_PX - BOTTOM_MARGIN_PX;
}

function clampTop(value: number) {
  const maxTop = Math.max(TOP_CLEARANCE_PX, window.innerHeight - BUTTON_SIZE_PX - BOTTOM_MARGIN_PX);
  return Math.min(Math.max(value, TOP_CLEARANCE_PX), maxTop);
}

export function QuickActionsWidget() {
  const { t } = useTranslation();
  const { images } = useTicketTypeImages();
  const reducedMotion = useReducedMotion();
  const [top, setTop] = useState(() => clampTop(defaultTop()));
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [sloganVisible, setSloganVisible] = useState(false);
  const dragRef = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      setTop((current) => clampTop(current));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timeoutId: number;

    function cycle(showing: boolean) {
      setSloganVisible(showing);
      timeoutId = window.setTimeout(() => cycle(!showing), showing ? SLOGAN_VISIBLE_MS : SLOGAN_HIDDEN_MS);
    }

    timeoutId = window.setTimeout(() => cycle(true), SLOGAN_INITIAL_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Window-level listeners while dragging — more robust than relying on setPointerCapture
  // staying attached to the button as it moves under the pointer mid-drag.
  useEffect(() => {
    if (!dragging) return;

    function handleMove(event: PointerEvent) {
      const state = dragRef.current;
      if (!state) return;
      const deltaY = event.clientY - state.startY;
      if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) state.moved = true;
      if (state.moved) setTop(clampTop(state.startTop + deltaY));
    }

    function handleUp() {
      setDragging(false);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging]);

  // Fade the whole widget out once the footer scrolls into view, so it never sits on top of footer text.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (footerVisible) setExpanded(false);
  }, [footerVisible]);

  useEffect(() => {
    if (!expanded) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setExpanded(false);
    }
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded]);

  function handleTogglePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    dragRef.current = { startY: event.clientY, startTop: top, moved: false };
    setDragging(true);
  }

  function handleToggleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (dragRef.current?.moved) {
      event.preventDefault();
    } else {
      setExpanded((current) => !current);
    }
    dragRef.current = null;
  }

  const itemTransition = reducedMotion ? '' : 'transition-all duration-200 ease-out';

  return (
    <>
      <div
        ref={rootRef}
        className={`fixed right-4 z-40 flex items-center gap-3 sm:right-6 ${
          reducedMotion ? '' : 'transition-opacity duration-300'
        } ${footerVisible ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        style={{ top: `${top}px` }}
      >
        <div
          role="status"
          aria-hidden={!sloganVisible || expanded}
          className={`relative max-w-[170px] rounded-2xl border border-border bg-elevated px-3.5 py-2.5 text-xs font-semibold leading-snug text-foreground shadow-xl shadow-black/40 transition-all ${
            expanded ? 'duration-150' : 'duration-500'
          } ${sloganVisible && !expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'}`}
        >
          {t('quickActions.slogan')}
          <span
            aria-hidden="true"
            className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-border bg-elevated"
          />
        </div>

        <div className="relative">
          <div
            className={`absolute bottom-full right-0 mb-3 flex flex-col items-end gap-3 ${itemTransition} ${
              expanded ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="comic-pill h-8 whitespace-nowrap px-3 text-[10px]">
                {t('quickActions.topupLabel')}
              </span>
              <button
                type="button"
                aria-label={t('quickActions.topupLabel')}
                onClick={() => {
                  setExpanded(false);
                  setTopupOpen(true);
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-canvas bg-surface shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                  {images.topup ? (
                    <img src={images.topup} alt="" draggable={false} className="h-full w-full object-cover" />
                  ) : (
                    <CoinIcon className="h-5 w-5 text-accent-secondary" />
                  )}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="comic-pill h-8 whitespace-nowrap px-3 text-[10px]">
                {t('quickActions.ticketLabel')}
              </span>
              <Link
                to="/ticket-calculator"
                aria-label={t('quickActions.ticketLabel')}
                onClick={() => setExpanded(false)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-canvas bg-surface shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                  {images.black ? (
                    <img src={images.black} alt="" draggable={false} className="h-full w-full object-cover" />
                  ) : (
                    <TicketIcon className="h-5 w-5 text-accent-secondary" />
                  )}
                </span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={expanded}
            aria-label={expanded ? t('quickActions.closeLabel') : t('quickActions.openLabel')}
            draggable={false}
            onPointerDown={handleTogglePointerDown}
            onClick={handleToggleClick}
            onDragStart={(event) => event.preventDefault()}
            style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-canvas bg-accent-secondary text-canvas shadow-[0_4px_0_rgba(0,0,0,0.35)] ${
              dragging ? '' : 'transition-transform duration-200 hover:scale-105'
            }`}
          >
            {!expanded && (
              <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-accent-secondary/40" />
            )}
            <span
              className={`relative flex ${reducedMotion ? '' : 'transition-transform duration-300'} ${
                expanded ? 'rotate-90' : 'rotate-0'
              }`}
            >
              {expanded ? <XIcon className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6" />}
            </span>
          </button>
        </div>
      </div>

      <TopupModal isOpen={topupOpen} onClose={() => setTopupOpen(false)} />
    </>
  );
}
