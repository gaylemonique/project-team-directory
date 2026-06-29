"use client";

import { useState } from "react";
import type { TeamMember } from "@/types/team-directory";
import { getInitials } from "@/lib/team-directory/validation";

type TeamMemberCardProps = {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  isDeleting: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const [imageError, setImageError] = useState(false);
  const showPhoto = member.photo_url && !imageError;

  if (showPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.photo_url!}
        alt={`${member.name} profile photo`}
        className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-sm font-semibold text-muted"
    >
      {getInitials(member.name) || "?"}
    </div>
  );
}

export function TeamMemberCard({
  member,
  onEdit,
  onDelete,
  isDeleting,
}: TeamMemberCardProps) {
  const categoryName = member.project_categories?.name ?? "Uncategorized";

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 shadow-none">
      <div className="flex gap-3">
        <MemberAvatar member={member} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg leading-tight text-foreground">
            {member.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">{member.role}</p>
          <p className="mt-2 inline-flex max-w-full rounded-sm bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
            <span className="truncate">{categoryName}</span>
          </p>
        </div>
      </div>

      <dl className="mt-4 grid flex-1 gap-3">
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
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {member.profile_url ? (
          <a
            href={member.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            View profile
          </a>
        ) : null}

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(member)}
            disabled={isDeleting}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(member)}
            disabled={isDeleting}
            className="rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger transition-colors hover:border-danger/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
