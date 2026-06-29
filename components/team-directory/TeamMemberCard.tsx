"use client";

import { useState } from "react";
import type { TeamMember } from "@/types/team-directory";
import { getInitials } from "@/lib/team-directory/validation";

type TeamMemberCardProps = {
  member: TeamMember;
  index: number;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onView: (member: TeamMember) => void;
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
        className="h-14 w-14 shrink-0 rounded-md border border-border object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-sm font-semibold text-muted transition-colors group-hover:border-border-strong group-hover:bg-accent-soft group-hover:text-accent"
    >
      {getInitials(member.name) || "?"}
    </div>
  );
}

export function TeamMemberCard({
  member,
  index,
  onEdit,
  onDelete,
  onView,
  isDeleting,
}: TeamMemberCardProps) {
  const categoryName = member.project_categories?.name ?? "Unassigned";

  return (
    <article
      className={[
        "group card-lift flex h-full flex-col rounded-lg border border-border bg-surface animate-fade-in-up",
        isDeleting ? "pointer-events-none opacity-50" : "",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => onView(member)}
        disabled={isDeleting}
        className="interactive flex flex-1 flex-col p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/30"
      >
        <div className="flex gap-3">
          <MemberAvatar member={member} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg leading-tight text-foreground group-hover:text-accent">
              {member.name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted">{member.role}</p>
            <p className="mt-2 inline-flex max-w-full rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
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

        <p className="interactive mt-4 text-sm font-medium text-accent">
          View details →
        </p>
      </button>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 pb-4 pt-0">
        {member.profile_url ? (
          <a
            href={member.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="interactive rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-border-strong hover:bg-surface-muted"
          >
            View GitHub profile
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(member)}
          disabled={isDeleting}
          className="interactive rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-border-strong hover:bg-surface-muted disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(member)}
          disabled={isDeleting}
          className="interactive rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger hover:border-danger/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
