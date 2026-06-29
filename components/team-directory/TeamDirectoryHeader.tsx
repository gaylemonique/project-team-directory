export function TeamDirectoryHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Internal tool
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Project Team Directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Introduce yourself under your project category. Add profiles, keep
              them current, and browse who is working on what.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
