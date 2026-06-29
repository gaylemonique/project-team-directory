"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/team-directory/EmptyState";
import { DirectoryLoadingSkeleton } from "@/components/team-directory/DirectoryLoadingSkeleton";
import { ProjectCategoryFilter } from "@/components/team-directory/ProjectCategoryFilter";
import { TeamDirectoryHeader } from "@/components/team-directory/TeamDirectoryHeader";
import { TeamMemberCard } from "@/components/team-directory/TeamMemberCard";
import { TeamMemberDetailModal } from "@/components/team-directory/TeamMemberDetailModal";
import { TeamMemberForm } from "@/components/team-directory/TeamMemberForm";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  deleteTeamMemberPhoto,
  isManagedTeamMemberPhoto,
  uploadTeamMemberPhoto,
  validatePhotoFile,
} from "@/lib/supabase/storage";
import {
  sortProjectCategoriesByUpdatedAt,
} from "@/lib/team-directory/category-validation";
import {
  formDataToPayload,
  memberToFormData,
  validateTeamMemberForm,
} from "@/lib/team-directory/validation";
import {
  EMPTY_FORM,
  FILTER_ALL,
  ADD_NEW_CATEGORY,
  type CategoryFilterValue,
  type FormErrors,
  type ProjectCategory,
  type TeamMember,
  type TeamMemberFormData,
} from "@/types/team-directory";

const MEMBER_SELECT =
  "*, project_categories(id, name, description, team_lead, created_at)";

type TeamDirectoryViewProps = {
  initialCategoryId?: string | null;
  initialMemberId?: string | null;
  mode?: "full" | "form";
};

export function TeamDirectoryView({
  initialCategoryId = null,
  initialMemberId = null,
  mode = "full",
}: TeamDirectoryViewProps) {
  const router = useRouter();
  const isFormMode = mode === "form";
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<CategoryFilterValue>(FILTER_ALL);
  const [formData, setFormData] = useState<TeamMemberFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingDeleteMember, setPendingDeleteMember] =
    useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const photoObjectUrlRef = useRef<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!actionSuccess) return;

    const timer = window.setTimeout(() => {
      setActionSuccess(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [actionSuccess]);

  const revokePhotoObjectUrl = () => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
      photoObjectUrlRef.current = null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchDirectoryData() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setLoadError(
            "Supabase is not configured. Copy .env.local.example to .env.local and add your sandbox credentials. See docs/SUPABASE_SETUP.md.",
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();

        const [categoriesResult, membersResult] = await Promise.all([
          supabase.from("project_categories").select("*").order("name"),
          supabase
            .from("team_members")
            .select(MEMBER_SELECT)
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        if (categoriesResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              categoriesResult.error,
              "Unable to load project categories.",
            ),
          );
        }

        if (membersResult.error) {
          throw new Error(
            getSupabaseErrorMessage(
              membersResult.error,
              "Unable to load team members.",
            ),
          );
        }

        setCategories(categoriesResult.data ?? []);
        const loadedMembers = (membersResult.data ?? []) as TeamMember[];
        setMembers(loadedMembers);

        const categoryIds = new Set(
          (categoriesResult.data ?? []).map((category) => category.id),
        );
        if (initialCategoryId && categoryIds.has(initialCategoryId)) {
          if (isFormMode) {
            setFormData((current) => ({
              ...current,
              project_category_id: initialCategoryId,
            }));
          } else {
            setFilter(initialCategoryId);
          }
        }

        if (initialMemberId) {
          const memberToEdit = loadedMembers.find(
            (member) => member.id === initialMemberId,
          );
          if (memberToEdit) {
            setEditingMemberId(memberToEdit.id);
            setFormData(memberToFormData(memberToEdit));
            setExistingPhotoUrl(memberToEdit.photo_url);
            setPhotoPreviewUrl(memberToEdit.photo_url);
          }
        }

        setLoadError(null);
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load team directory data.";
        setLoadError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchDirectoryData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, initialCategoryId, initialMemberId, isFormMode]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError(null);
    setRefreshKey((current) => current + 1);
  };

  const filteredMembers = useMemo(() => {
    if (filter === FILTER_ALL) return members;
    return members.filter((member) => member.project_category_id === filter);
  }, [filter, members]);

  const showSuccess = (message: string) => {
    setActionSuccess(message);
    setActionError(null);
  };

  const resetForm = () => {
    revokePhotoObjectUrl();
    setFormData(
      initialCategoryId && isFormMode
        ? { ...EMPTY_FORM, project_category_id: initialCategoryId }
        : EMPTY_FORM,
    );
    setFormErrors({});
    setEditingMemberId(null);
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoError(undefined);
    setExistingPhotoUrl(null);
    setNewCategoryName("");
  };

  const handleFormCancel = () => {
    if (isFormMode && initialCategoryId) {
      router.push(`/projects/${initialCategoryId}`);
      return;
    }

    resetForm();
  };

  const handleFieldChange = (
    field: keyof TeamMemberFormData,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (field === "project_category_id" && value !== ADD_NEW_CATEGORY) {
      setNewCategoryName("");
    }
    setFormErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "project_category_id" ? { new_category_name: undefined } : {}),
    }));
    setActionError(null);
  };

  const handleNewCategoryNameChange = (value: string) => {
    setNewCategoryName(value);
    setFormErrors((current) => ({ ...current, new_category_name: undefined }));
    setActionError(null);
  };

  const handlePhotoSelect = (file: File | null) => {
    if (!file) return;

    const error = validatePhotoFile(file);
    setPhotoError(error);
    if (error) {
      setSelectedPhotoFile(null);
      return;
    }

    revokePhotoObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    photoObjectUrlRef.current = objectUrl;
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(objectUrl);
    setActionError(null);
  };

  const handlePhotoRemove = () => {
    revokePhotoObjectUrl();
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoError(undefined);
    setFormData((current) => ({ ...current, photo_url: "" }));
  };

  const handleSubmit = async () => {
    const errors = validateTeamMemberForm(formData, { newCategoryName });
    const nextPhotoError = validatePhotoFile(selectedPhotoFile);
    setFormErrors(errors);
    setPhotoError(nextPhotoError);

    if (Object.keys(errors).length > 0 || nextPhotoError) {
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      const supabase = getSupabaseClient();
      let photoUrl = formData.photo_url.trim() || null;
      const previousPhotoUrl = existingPhotoUrl;
      let categoryId = formData.project_category_id;

      if (categoryId === ADD_NEW_CATEGORY) {
        const trimmedName = newCategoryName.trim();
        const { data: createdCategory, error: categoryError } = await supabase
          .from("project_categories")
          .insert({ name: trimmedName })
          .select("*")
          .single();

        if (categoryError) {
          throw new Error(
            getSupabaseErrorMessage(
              categoryError,
              "Unable to create project.",
            ),
          );
        }

        categoryId = createdCategory.id;
        setCategories((current) =>
          sortProjectCategoriesByUpdatedAt(
            [...current, createdCategory as ProjectCategory],
            "latest",
          ),
        );
        setNewCategoryName("");
      }

      if (selectedPhotoFile) {
        photoUrl = await uploadTeamMemberPhoto(
          selectedPhotoFile,
          editingMemberId ?? undefined,
        );
      }

      const payload = {
        ...formDataToPayload(formData),
        project_category_id: categoryId,
        photo_url: photoUrl,
      };

      if (editingMemberId) {
        const { data, error } = await supabase
          .from("team_members")
          .update(payload)
          .eq("id", editingMemberId)
          .select(MEMBER_SELECT)
          .single();

        if (error) {
          throw new Error(
            getSupabaseErrorMessage(error, "Request failed."),
          );
        }

        if (
          previousPhotoUrl &&
          isManagedTeamMemberPhoto(previousPhotoUrl) &&
          previousPhotoUrl !== photoUrl
        ) {
          await deleteTeamMemberPhoto(previousPhotoUrl);
        }

        setMembers((current) =>
          current.map((member) =>
            member.id === editingMemberId ? (data as TeamMember) : member,
          ),
        );

        if (isFormMode && initialCategoryId) {
          router.push(`/projects/${initialCategoryId}`);
          return;
        }

        showSuccess(`${payload.name}'s member was updated.`);
        resetForm();
      } else {
        const { data, error } = await supabase
          .from("team_members")
          .insert(payload)
          .select(MEMBER_SELECT)
          .single();

        if (error) {
          throw new Error(
            getSupabaseErrorMessage(error, "Request failed."),
          );
        }

        setMembers((current) => [data as TeamMember, ...current]);

        if (isFormMode && initialCategoryId) {
          router.push(`/projects/${initialCategoryId}`);
          return;
        }

        showSuccess(`${payload.name} was added to the directory.`);
        resetForm();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save team member.";
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setViewingMember(null);
    revokePhotoObjectUrl();
    setEditingMemberId(member.id);
    setFormData(memberToFormData(member));
    setExistingPhotoUrl(member.photo_url);
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(member.photo_url);
    setPhotoError(undefined);
    setFormErrors({});
    setActionError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRequest = (member: TeamMember) => {
    setViewingMember(null);
    setPendingDeleteMember(member);
    setActionError(null);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteMember(null);
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
          getSupabaseErrorMessage(error, "Unable to delete team member."),
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

      showSuccess(`${pendingDeleteMember.name}'s member was deleted.`);

      if (editingMemberId === pendingDeleteMember.id) {
        resetForm();
      }

      setPendingDeleteMember(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete team member.";
      setActionError(message);
    } finally {
      setDeletingMemberId(null);
    }
  };

  const lockedCategory = useMemo(
    () =>
      initialCategoryId
        ? categories.find((category) => category.id === initialCategoryId) ?? null
        : null,
    [categories, initialCategoryId],
  );

  return (
    <div className="min-h-dvh bg-background">
      {isFormMode ? (
        <header className="animate-fade-in border-b border-border bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {initialCategoryId ? (
              <Link
                href={`/projects/${initialCategoryId}`}
                className="interactive mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
              >
                ← Back to project
              </Link>
            ) : null}
            <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              {editingMemberId ? "Edit member" : "Create member"}
            </h1>
            {lockedCategory ? (
              <p className="mt-2 text-sm text-muted">
                For{" "}
                <span className="font-medium text-foreground">
                  {lockedCategory.name}
                </span>
              </p>
            ) : null}
          </div>
        </header>
      ) : (
        <TeamDirectoryHeader
          memberCount={members.length}
          categoryCount={categories.length}
        />
      )}

      <main
        className={[
          "mx-auto px-4 py-8 sm:px-6 lg:px-8",
          isFormMode ? "max-w-3xl" : "max-w-6xl",
        ].join(" ")}
      >
        {loadError ? (
          <div
            role="alert"
            className="animate-fade-in-up mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <p className="font-medium">Unable to load team directory</p>
            <p className="mt-1">{loadError}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="interactive mt-3 rounded-md border border-danger/30 px-3 py-1.5 text-sm font-medium hover:border-danger/50"
            >
              Try again
            </button>
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

        {isFormMode ? (
          isLoading ? (
            <DirectoryLoadingSkeleton />
          ) : (
            <TeamMemberForm
              categories={categories}
              formData={formData}
              errors={formErrors}
              newCategoryName={newCategoryName}
              photoPreviewUrl={photoPreviewUrl}
              photoFileName={selectedPhotoFile?.name ?? null}
              photoError={photoError}
              isSaving={isSaving}
              isEditing={Boolean(editingMemberId)}
              lockCategory={Boolean(initialCategoryId)}
              lockedCategoryName={lockedCategory?.name}
              onChange={handleFieldChange}
              onNewCategoryNameChange={handleNewCategoryNameChange}
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handlePhotoRemove}
              onSubmit={() => void handleSubmit()}
              onCancel={handleFormCancel}
            />
          )
        ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="order-2 lg:order-1">
            <div className="mb-5">
              <ProjectCategoryFilter
                categories={categories}
                value={filter}
                onChange={setFilter}
              />
            </div>

            {isLoading ? (
              <DirectoryLoadingSkeleton />
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                title={
                  members.length === 0
                    ? "No team members added yet."
                    : "No members in this project."
                }
                description={
                  members.length === 0
                    ? "Create the first member to start building the project directory."
                    : "Try another project or add a member for this project area."
                }
              />
            ) : (
              <ul
                key={filter}
                className="grid gap-4 sm:grid-cols-2"
              >
                {filteredMembers.map((member, index) => (
                  <li key={member.id}>
                    <TeamMemberCard
                      member={member}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRequest}
                      onView={setViewingMember}
                      isDeleting={deletingMemberId === member.id}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="order-1 lg:sticky lg:top-6 lg:order-2">
            <TeamMemberForm
              categories={categories}
              formData={formData}
              errors={formErrors}
              newCategoryName={newCategoryName}
              photoPreviewUrl={photoPreviewUrl}
              photoFileName={selectedPhotoFile?.name ?? null}
              photoError={photoError}
              isSaving={isSaving}
              isEditing={Boolean(editingMemberId)}
              onChange={handleFieldChange}
              onNewCategoryNameChange={handleNewCategoryNameChange}
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handlePhotoRemove}
              onSubmit={() => void handleSubmit()}
              onCancel={resetForm}
            />
          </div>
        </div>
        )}
      </main>

      {viewingMember ? (
        <TeamMemberDetailModal
          member={viewingMember}
          onClose={() => setViewingMember(null)}
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
              className="font-display text-lg text-foreground"
            >
              Delete member
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Are you sure you want to delete this team member?
            </p>
            <p className="mt-3 rounded-md bg-surface-muted px-3 py-2 text-sm text-foreground">
              {pendingDeleteMember.name}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                {deletingMemberId ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="inline-block h-4 w-4 animate-spin-slow rounded-full border-2 border-white/30 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete member"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
