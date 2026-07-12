interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label, className = '' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-16 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-info"
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
