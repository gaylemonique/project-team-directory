type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="animate-fade-in-up rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-muted text-lg text-muted"
      >
        +
      </div>
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
