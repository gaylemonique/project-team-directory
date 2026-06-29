"use client";

import Link from "next/link";
import type { ProjectCategory } from "@/types/team-directory";

type ProjectCategoryCardProps = {
  category: ProjectCategory;
  memberCount: number;
  index: number;
  isDeleting: boolean;
  onDeleteRequest: (category: ProjectCategory) => void;
};

export function ProjectCategoryCard({
  category,
  memberCount,
  index,
  isDeleting,
  onDeleteRequest,
}: ProjectCategoryCardProps) {
  return (
    <article
      className={[
        "group card-lift flex h-full flex-col rounded-lg border border-border bg-surface animate-fade-in-up",
        isDeleting ? "pointer-events-none opacity-50" : "",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link
        href={`/projects/${category.id}`}
        className="flex flex-1 flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/30"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl leading-tight text-foreground group-hover:text-accent">
            {category.name}
          </h2>
          <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums text-muted">
            {memberCount} {memberCount === 1 ? "profile" : "profiles"}
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
          View team →
        </p>
      </Link>

      <div className="border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => onDeleteRequest(category)}
          disabled={isDeleting}
          className="interactive rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger hover:border-danger/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete category"}
        </button>
      </div>
    </article>
  );
}
