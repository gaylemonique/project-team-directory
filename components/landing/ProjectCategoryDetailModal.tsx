"use client";

import Link from "next/link";
import type { ProjectCategory } from "@/types/team-directory";

type ProjectCategoryDetailModalProps = {
  category: ProjectCategory;
  memberCount: number;
  onClose: () => void;
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function ProjectCategoryDetailModal({
  category,
  memberCount,
  onClose,
}: ProjectCategoryDetailModalProps) {
  return (
    <div
      className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-dialog-title"
        className="animate-scale-in max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Project
            </p>
            <h2
              id="project-detail-dialog-title"
              className="mt-1 font-display text-2xl text-foreground"
            >
              {category.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="interactive shrink-0 rounded-md border border-border px-2.5 py-1 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
            aria-label="Close project details"
          >
            Close
          </button>
        </div>

        <dl className="mt-5 space-y-4">
          <DetailRow label="Members">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </DetailRow>

          <DetailRow label="Description">
            {category.description ? (
              <span className="leading-relaxed text-muted">{category.description}</span>
            ) : (
              <span className="text-placeholder">No description yet.</span>
            )}
          </DetailRow>

          <DetailRow label="Team lead">
            {category.team_lead ? (
              category.team_lead
            ) : (
              <span className="text-placeholder">Not assigned</span>
            )}
          </DetailRow>
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <Link
            href={`/projects/${category.id}`}
            className="interactive inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            View team
          </Link>
        </div>
      </div>
    </div>
  );
}
