"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DirectoryLoadingSkeleton } from "@/components/team-directory/DirectoryLoadingSkeleton";
import { EmptyState } from "@/components/team-directory/EmptyState";
import { TeamMemberCard } from "@/components/team-directory/TeamMemberCard";
import { CategoryFormDialog } from "@/components/landing/CategoryFormDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  categoryToFormData,
  EMPTY_CATEGORY_FORM,
  formDataToCategoryPayload,
  validateProjectCategoryForm,
  type ProjectCategoryFormData,
  type ProjectCategoryFormErrors,
} from "@/lib/team-directory/category-validation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  deleteTeamMemberPhoto,
  isManagedTeamMemberPhoto,
} from "@/lib/supabase/storage";
import type { ProjectCategory, TeamMember } from "@/types/team-directory";

const MEMBER_SELECT =
  "*, project_categories(id, name, description, team_lead, created_at)";

type ProjectMembersViewProps = {
  categoryId: string;
};

export function ProjectMembersView({ categoryId }: ProjectMembersViewProps) {
  const router = useRouter();
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingDeleteMember, setPendingDeleteMember] =
    useState<TeamMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] =
    useState<ProjectCategoryFormData>(EMPTY_CATEGORY_FORM);
  const [categoryFormErrors, setCategoryFormErrors] =
    useState<ProjectCategoryFormErrors>({});
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    if (!actionSuccess) return;

    const timer = window.setTimeout(() => {
      setActionSuccess(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [actionSuccess]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProjectMembers() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setLoadError(
            "Supabase is not configured. Copy .env.local.example to .env.local and add your sandbox credentials.",
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const [categoryResult, membersResult] = await Promise.all([
          supabase
            .from("project_categories")
            .select("*")
            .eq("id", categoryId)
            .maybeSingle(),
          supabase
            .from("team_members")
            .select(MEMBER_SELECT)
            .eq("project_category_id", categoryId)
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        if (categoryResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              categoryResult.error,
              "Unable to load project.",
            ),
          );
        }

        if (!categoryResult.data) {
          setLoadError("This project could not be found.");
          setCategory(null);
          setMembers([]);
          return;
        }

        if (membersResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              membersResult.error,
              "Unable to load team members.",
            ),
          );
        }

        setCategory(categoryResult.data);
        setMembers((membersResult.data ?? []) as TeamMember[]);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load project members.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchProjectMembers();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const memberCountLabel = useMemo(() => {
    const count = members.length;
    return `${count} ${count === 1 ? "member" : "members"}`;
  }, [members.length]);

  const handleEdit = (member: TeamMember) => {
    router.push(
      `/team-directory/new?category=${categoryId}&edit=${member.id}`,
    );
  };

  const handleDeleteRequest = (member: TeamMember) => {
    setPendingDeleteMember(member);
    setActionError(null);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteMember(null);
  };

  const handleEditCategoryOpen = () => {
    if (!category) return;
    setCategoryFormData(categoryToFormData(category));
    setCategoryFormErrors({});
    setActionError(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategoryCancel = () => {
    if (isSavingCategory) return;
    setIsCategoryDialogOpen(false);
    setCategoryFormData(EMPTY_CATEGORY_FORM);
    setCategoryFormErrors({});
  };

  const handleCategoryFormChange = (
    field: keyof ProjectCategoryFormData,
    value: string,
  ) => {
    setCategoryFormData((current) => ({ ...current, [field]: value }));
    if (categoryFormErrors[field]) {
      setCategoryFormErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleCategoryFormSubmit = async () => {
    if (!category) return;

    const errors = validateProjectCategoryForm(categoryFormData);
    setCategoryFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingCategory(true);
    setActionError(null);

    try {
      const supabase = getSupabaseClient();
      const payload = formDataToCategoryPayload(categoryFormData);
      const { data, error } = await supabase
        .from("project_categories")
        .update(payload)
        .eq("id", category.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(
          getSupabaseErrorMessage(error, "Unable to update project category."),
        );
      }

      setCategory(data);
      setActionSuccess(`${payload.name} was updated.`);
      setIsCategoryDialogOpen(false);
      setCategoryFormData(EMPTY_CATEGORY_FORM);
      setCategoryFormErrors({});
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update project category.",
      );
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteMember) return;

    setDeletingMemberId(pendingDeleteMember.id);
    setActionError(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", pendingDeleteMember.id);

      if (error) {
        throw new Error(
          getSupabaseErrorMessage(error, "Unable to delete team member profile."),
        );
      }

      if (
        pendingDeleteMember.photo_url &&
        isManagedTeamMemberPhoto(pendingDeleteMember.photo_url)
      ) {
        await deleteTeamMemberPhoto(pendingDeleteMember.photo_url);
      }

      setMembers((current) =>
        current.filter((member) => member.id !== pendingDeleteMember.id),
      );
      setActionSuccess(`${pendingDeleteMember.name}'s profile was deleted.`);
      setPendingDeleteMember(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete team member profile.",
      );
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="animate-fade-in border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="interactive mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            ← All projects
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Project team
              </p>
              <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                {category?.name ?? "Project members"}
              </h1>
              {category?.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {category.description}
                </p>
              ) : null}
              {!isLoading && category ? (
                <p className="mt-2 text-sm text-muted">{memberCountLabel}</p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ThemeToggle />
              {!isLoading && category ? (
                <button
                  type="button"
                  onClick={handleEditCategoryOpen}
                  disabled={isSavingCategory}
                  className="interactive inline-flex min-h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit project
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loadError ? (
          <div
            role="alert"
            className="animate-fade-in-up mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {loadError}
          </div>
        ) : null}

        {actionSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="animate-fade-in-up mb-6 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-accent"
          >
            {actionSuccess}
          </div>
        ) : null}

        {actionError ? (
          <div
            role="alert"
            className="animate-fade-in-up mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {actionError}
          </div>
        ) : null}

        {isLoading ? <DirectoryLoadingSkeleton /> : null}

        {!isLoading && !loadError && category && members.length === 0 ? (
          <EmptyState
            title="No members in this project yet."
            description="Be the first to add a profile for this project area."
          />
        ) : null}

        {!isLoading && !loadError && members.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {members.map((member, index) => (
              <li key={member.id}>
                <TeamMemberCard
                  member={member}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  isDeleting={deletingMemberId === member.id}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {!isLoading && !loadError && category ? (
          <div className="mt-8 flex justify-center border-t border-border pt-8">
            <Link
              href={`/team-directory/new?category=${categoryId}`}
              className="interactive inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Add member
            </Link>
          </div>
        ) : null}
      </main>

      {isCategoryDialogOpen ? (
        <CategoryFormDialog
          mode="edit"
          formData={categoryFormData}
          errors={categoryFormErrors}
          isSaving={isSavingCategory}
          onChange={handleCategoryFormChange}
          onSubmit={() => void handleCategoryFormSubmit()}
          onCancel={handleEditCategoryCancel}
        />
      ) : null}

      {pendingDeleteMember ? (
        <div
          className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="presentation"
          onClick={handleDeleteCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="animate-scale-in w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-dialog-title"
              className="font-display text-xl text-foreground"
            >
              Delete profile
            </h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {pendingDeleteMember.name}
              </span>
              &apos;s profile?
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={Boolean(deletingMemberId)}
                className="interactive rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={Boolean(deletingMemberId)}
                className="interactive inline-flex items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingMemberId ? "Deleting..." : "Delete profile"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
