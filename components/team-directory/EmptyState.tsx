type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center"
    >
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
