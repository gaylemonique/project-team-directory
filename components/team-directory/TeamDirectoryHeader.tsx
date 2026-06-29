import { ThemeToggle } from "@/components/theme/ThemeToggle";

type TeamDirectoryHeaderProps = {
  memberCount: number;
  categoryCount: number;
};

export function TeamDirectoryHeader({
  memberCount,
  categoryCount,
}: TeamDirectoryHeaderProps) {
  return (
    <header className="animate-fade-in border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Project Team Directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Introduce yourself under your project category. Add profiles, keep
              them current, and browse who is working on what.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ThemeToggle />
            <dl className="flex shrink-0 gap-3">
              {memberCount > 0 ? (
                <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-center">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Profiles
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-foreground">
                    {memberCount}
                  </dd>
                </div>
              ) : null}
              <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-center">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Categories
                </dt>
                <dd className="mt-1 font-display text-2xl text-foreground">
                  {categoryCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </header>
  );
}
