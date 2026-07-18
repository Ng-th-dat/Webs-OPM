/** Decorative printed-page frame — thin hairline inset + corner register marks, fixed above content but below interactive chrome. */
export function MangaFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[35]">
      <div className="absolute inset-2 border border-accent-secondary/40 sm:inset-3" />
      <div className="absolute left-2 top-2 h-3.5 w-3.5 border-l-2 border-t-2 border-accent-secondary sm:left-3 sm:top-3" />
      <div className="absolute right-2 top-2 h-3.5 w-3.5 border-r-2 border-t-2 border-accent-secondary sm:right-3 sm:top-3" />
      <div className="absolute bottom-2 left-2 h-3.5 w-3.5 border-b-2 border-l-2 border-accent-secondary sm:bottom-3 sm:left-3" />
      <div className="absolute bottom-2 right-2 h-3.5 w-3.5 border-b-2 border-r-2 border-accent-secondary sm:bottom-3 sm:right-3" />
    </div>
  );
}
