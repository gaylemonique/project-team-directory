"use client";

import type { ProjectCategory } from "@/types/team-directory";

type ProjectCategoryCardProps = {
  category: ProjectCategory;
  memberCount: number;
  index: number;
  isDeleting: boolean;
  isEditing: boolean;
  onEditRequest: (category: ProjectCategory) => void;
  onDeleteRequest: (category: ProjectCategory) => void;
  onViewRequest: (category: ProjectCategory) => void;
};

export function ProjectCategoryCard({
  category,
  memberCount,
  index,
  isDeleting,
  isEditing,
  onEditRequest,
  onDeleteRequest,
  onViewRequest,
}: ProjectCategoryCardProps) {
  const isBusy = isDeleting || isEditing;
  return (
    <article
      className={[
        "group card-lift flex h-full flex-col rounded-lg border border-border bg-surface animate-fade-in-up",
        isBusy ? "pointer-events-none opacity-50" : "",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => onViewRequest(category)}
        disabled={isBusy}
        className="interactive flex flex-1 flex-col p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/30"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl leading-tight text-foreground group-hover:text-accent">
            {category.name}
          </h2>
          <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums text-muted">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        {category.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {category.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-placeholder">No description yet.</p>
        )}

        {category.team_lead ? (
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Lead{" "}
            <span className="normal-case tracking-normal text-foreground">
              {category.team_lead}
            </span>
          </p>
        ) : null}

        <p className="interactive mt-5 text-sm font-medium text-accent">
          View details →
        </p>
      </button>

      <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => onEditRequest(category)}
          disabled={isBusy}
          className="interactive rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEditing ? "Saving..." : "Edit project"}
        </button>
        {category.website_url ? (
          <a
            href={category.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive rounded-md border border-accent/30 bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent hover:border-accent/50 hover:bg-accent-soft/80"
          >
            View project link
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onDeleteRequest(category)}
          disabled={isBusy}
          className="interactive rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger hover:border-danger/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete project"}
        </button>
      </div>
    </article>
  );
}
