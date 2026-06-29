"use client";

import { useState } from "react";
import type { TeamMember } from "@/types/team-directory";
import { getInitials } from "@/lib/team-directory/validation";

type TeamMemberDetailModalProps = {
  member: TeamMember;
  isDeleting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

function ModalAvatar({ member }: { member: TeamMember }) {
  const [imageError, setImageError] = useState(false);
  const showPhoto = member.photo_url && !imageError;

  if (showPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.photo_url!}
        alt={`${member.name} profile photo`}
        className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-lg font-semibold text-muted"
    >
      {getInitials(member.name) || "?"}
    </div>
  );
}

export function TeamMemberDetailModal({
  member,
  isDeleting,
  onClose,
  onEdit,
  onDelete,
}: TeamMemberDetailModalProps) {
  const categoryName = member.project_categories?.name ?? "Unassigned";

  return (
    <div
      className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-detail-dialog-title"
        className="animate-scale-in max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            <ModalAvatar member={member} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Team member
              </p>
              <h2
                id="member-detail-dialog-title"
                className="mt-1 font-display text-2xl text-foreground"
              >
                {member.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{member.role}</p>
              <p className="mt-2 inline-flex max-w-full rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                <span className="truncate">{categoryName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="interactive shrink-0 rounded-md border border-border px-2.5 py-1 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
            aria-label="Close member details"
          >
            Close
          </button>
        </div>

        <dl className="mt-6 grid gap-4">
          {member.project_assignment ? (
            <DetailRow label="Project assignment" value={member.project_assignment} />
          ) : null}
          {member.favorite_stack ? (
            <DetailRow label="Favorite stack" value={member.favorite_stack} />
          ) : null}
          {member.current_focus ? (
            <DetailRow label="Current focus" value={member.current_focus} />
          ) : null}
          {member.learning_goal ? (
            <DetailRow label="Learning goal" value={member.learning_goal} />
          ) : null}
          {member.fun_fact ? (
            <DetailRow label="Fun fact" value={member.fun_fact} />
          ) : null}
          {!member.project_assignment &&
          !member.favorite_stack &&
          !member.current_focus &&
          !member.learning_goal &&
          !member.fun_fact ? (
            <p className="text-sm text-placeholder">
              No additional profile details yet.
            </p>
          ) : null}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {member.profile_url ? (
            <a
              href={member.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              View GitHub profile
            </a>
          ) : null}
          <button
            type="button"
            onClick={onEdit}
            disabled={isDeleting}
            className="interactive inline-flex min-h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="interactive inline-flex min-h-10 items-center justify-center rounded-md border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger hover:border-danger/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
