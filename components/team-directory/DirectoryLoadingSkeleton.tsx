export function DirectoryLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading team directory"
      className="animate-fade-in space-y-4"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="h-5 w-5 animate-shimmer rounded-full" />
        <div className="h-4 w-40 animate-shimmer rounded" />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            key={index}
            className="rounded-lg border border-border bg-surface p-4"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex gap-3">
              <div className="h-14 w-14 shrink-0 animate-shimmer rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-shimmer rounded" />
                <div className="h-3 w-1/2 animate-shimmer rounded" />
                <div className="h-5 w-24 animate-shimmer rounded-sm" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-shimmer rounded" />
              <div className="h-3 w-4/5 animate-shimmer rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
