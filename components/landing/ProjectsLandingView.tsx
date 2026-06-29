"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CategoryFormDialog } from "@/components/landing/CategoryFormDialog";
import { ProjectCategoryCard } from "@/components/landing/ProjectCategoryCard";
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
import type { ProjectCategory } from "@/types/team-directory";

function LandingSkeleton() {
  return (
    <div className="animate-fade-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="h-5 w-2/3 animate-shimmer rounded" />
          <div className="mt-4 h-3 w-full animate-shimmer rounded" />
          <div className="mt-2 h-3 w-4/5 animate-shimmer rounded" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsLandingView() {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<ProjectCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryDialogMode, setCategoryDialogMode] = useState<
    "add" | "edit" | null
  >(null);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(
    null,
  );
  const [categoryFormData, setCategoryFormData] =
    useState<ProjectCategoryFormData>(EMPTY_CATEGORY_FORM);
  const [categoryFormErrors, setCategoryFormErrors] =
    useState<ProjectCategoryFormErrors>({});
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!actionSuccess) return;

    const timer = window.setTimeout(() => {
      setActionSuccess(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [actionSuccess]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
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
        const [categoriesResult, membersResult] = await Promise.all([
          supabase.from("project_categories").select("*").order("name"),
          supabase.from("team_members").select("project_category_id"),
        ]);

        if (cancelled) return;

        if (categoriesResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              categoriesResult.error,
              "Unable to load projects.",
            ),
          );
        }

        if (membersResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              membersResult.error,
              "Unable to load team member counts.",
            ),
          );
        }

        const counts = (membersResult.data ?? []).reduce<Record<string, number>>(
          (accumulator, member) => {
            if (!member.project_category_id) return accumulator;
            accumulator[member.project_category_id] =
              (accumulator[member.project_category_id] ?? 0) + 1;
            return accumulator;
          },
          {},
        );

        setCategories(categoriesResult.data ?? []);
        setMemberCounts(counts);
        setTotalMembers(membersResult.data?.length ?? 0);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load projects.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const handleDeleteRequest = (category: ProjectCategory) => {
    setPendingDeleteCategory(category);
    setActionError(null);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteCategory(null);
  };

  const handleAddCategoryOpen = () => {
    setCategoryFormData(EMPTY_CATEGORY_FORM);
    setCategoryFormErrors({});
    setEditingCategory(null);
    setActionError(null);
    setCategoryDialogMode("add");
  };

  const handleEditCategoryRequest = (category: ProjectCategory) => {
    setCategoryFormData(categoryToFormData(category));
    setCategoryFormErrors({});
    setEditingCategory(category);
    setActionError(null);
    setCategoryDialogMode("edit");
  };

  const handleCategoryFormCancel = () => {
    if (isSavingCategory) return;
    setCategoryDialogMode(null);
    setEditingCategory(null);
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
    const errors = validateProjectCategoryForm(categoryFormData);
    setCategoryFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingCategory(true);
    setActionError(null);

    const payload = formDataToCategoryPayload(categoryFormData);
    const isEdit = categoryDialogMode === "edit" && editingCategory;

    if (isEdit) {
      setEditingCategoryId(editingCategory.id);
    }

    try {
      const supabase = getSupabaseClient();

      if (isEdit) {
        const { data, error } = await supabase
          .from("project_categories")
          .update(payload)
          .eq("id", editingCategory.id)
          .select("*")
          .single();

        if (error) {
          throw new Error(
            getSupabaseErrorMessage(error, "Unable to update project."),
          );
        }

        setCategories((current) =>
          current
            .map((category) =>
              category.id === editingCategory.id
                ? (data as ProjectCategory)
                : category,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        setActionSuccess(`${payload.name} was updated.`);
      } else {
        const { data, error } = await supabase
          .from("project_categories")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          throw new Error(
            getSupabaseErrorMessage(error, "Unable to create project."),
          );
        }

        setCategories((current) =>
          [...current, data as ProjectCategory].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setActionSuccess(`${payload.name} was added.`);
      }

      setCategoryDialogMode(null);
      setEditingCategory(null);
      setCategoryFormData(EMPTY_CATEGORY_FORM);
      setCategoryFormErrors({});
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Unable to update project."
            : "Unable to create project.",
      );
    } finally {
      setIsSavingCategory(false);
      setEditingCategoryId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteCategory) return;

    setDeletingCategoryId(pendingDeleteCategory.id);
    setActionError(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("project_categories")
        .delete()
        .eq("id", pendingDeleteCategory.id);

      if (error) {
        throw new Error(
          getSupabaseErrorMessage(error, "Unable to delete project."),
        );
      }

      setCategories((current) =>
        current.filter((category) => category.id !== pendingDeleteCategory.id),
      );
      setActionSuccess(`${pendingDeleteCategory.name} was deleted.`);
      setPendingDeleteCategory(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete project.",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="animate-fade-in border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Project Team Directory
              </p>
              <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                Choose a project
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Start with the project area you belong to, then browse profiles
                or add your own to the directory.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ThemeToggle />
              <dl className="flex shrink-0 gap-3">
                <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-center">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Projects
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-foreground">
                    {categories.length}
                  </dd>
                </div>
                {totalMembers > 0 ? (
                  <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-center">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Profiles
                    </dt>
                    <dd className="mt-1 font-display text-2xl text-foreground">
                      {totalMembers}
                    </dd>
                  </div>
                ) : null}
              </dl>
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

        {!loadError && isLoading ? <LandingSkeleton /> : null}

        {!loadError && !isLoading && sortedCategories.length === 0 ? (
          <div className="animate-fade-in-up rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center">
            <p className="font-display text-lg text-foreground">
              No projects yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Add a project to organize team profiles, or browse all
              members across projects.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddCategoryOpen}
                className="interactive inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Add a project
              </button>
              <Link
                href="/team-directory"
                className="interactive inline-flex min-h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                View all members
              </Link>
            </div>
          </div>
        ) : null}

        {!loadError && !isLoading && sortedCategories.length > 0 ? (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm text-muted">
                {sortedCategories.length}{" "}
                {sortedCategories.length === 1 ? "project" : "projects"} available
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddCategoryOpen}
                  className="interactive inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Add a project
                </button>
                <Link
                  href="/team-directory"
                  className="interactive text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  View all members
                </Link>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedCategories.map((category, index) => (
                <li key={category.id}>
                  <ProjectCategoryCard
                    category={category}
                    memberCount={memberCounts[category.id] ?? 0}
                    index={index}
                    isDeleting={deletingCategoryId === category.id}
                    isEditing={editingCategoryId === category.id}
                    onEditRequest={handleEditCategoryRequest}
                    onDeleteRequest={handleDeleteRequest}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </main>

      {categoryDialogMode ? (
        <CategoryFormDialog
          mode={categoryDialogMode}
          formData={categoryFormData}
          errors={categoryFormErrors}
          isSaving={isSavingCategory}
          onChange={handleCategoryFormChange}
          onSubmit={() => void handleCategoryFormSubmit()}
          onCancel={handleCategoryFormCancel}
        />
      ) : null}

      {pendingDeleteCategory ? (
        <div
          className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="presentation"
          onClick={handleDeleteCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-dialog-title"
            className="animate-scale-in w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-category-dialog-title"
              className="font-display text-xl text-foreground"
            >
              Delete project
            </h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {pendingDeleteCategory.name}
              </span>
              ?
              {(memberCounts[pendingDeleteCategory.id] ?? 0) > 0 ? (
                <>
                  {" "}
                  {(memberCounts[pendingDeleteCategory.id] ?? 0) === 1
                    ? "1 profile"
                    : `${memberCounts[pendingDeleteCategory.id]} profiles`}{" "}
                  in this project will become unassigned.
                </>
              ) : null}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={Boolean(deletingCategoryId)}
                className="interactive rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={Boolean(deletingCategoryId)}
                className="interactive inline-flex items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingCategoryId ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="inline-block h-4 w-4 animate-spin-slow rounded-full border-2 border-white/30 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete project"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
