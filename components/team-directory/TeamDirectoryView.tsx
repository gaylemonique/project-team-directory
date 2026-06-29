"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/team-directory/EmptyState";
import { ProjectCategoryFilter } from "@/components/team-directory/ProjectCategoryFilter";
import { TeamDirectoryHeader } from "@/components/team-directory/TeamDirectoryHeader";
import { TeamMemberCard } from "@/components/team-directory/TeamMemberCard";
import { TeamMemberForm } from "@/components/team-directory/TeamMemberForm";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteTeamMemberPhoto,
  isManagedTeamMemberPhoto,
  uploadTeamMemberPhoto,
  validatePhotoFile,
} from "@/lib/supabase/storage";
import {
  formDataToPayload,
  memberToFormData,
  validateTeamMemberForm,
} from "@/lib/team-directory/validation";
import {
  EMPTY_FORM,
  FILTER_ALL,
  type CategoryFilterValue,
  type FormErrors,
  type ProjectCategory,
  type TeamMember,
  type TeamMemberFormData,
} from "@/types/team-directory";

const MEMBER_SELECT =
  "*, project_categories(id, name, description, team_lead, created_at)";

export function TeamDirectoryView() {
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
  const [pendingDeleteMember, setPendingDeleteMember] =
    useState<TeamMember | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const photoObjectUrlRef = useRef<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

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
          throw new Error(categoriesResult.error.message);
        }

        if (membersResult.error) {
          throw new Error(membersResult.error.message);
        }

        setCategories(categoriesResult.data ?? []);
        setMembers((membersResult.data ?? []) as TeamMember[]);
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
  }, [refreshKey]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError(null);
    setRefreshKey((current) => current + 1);
  };

  const filteredMembers = useMemo(() => {
    if (filter === FILTER_ALL) return members;
    return members.filter((member) => member.project_category_id === filter);
  }, [filter, members]);

  const resetForm = () => {
    revokePhotoObjectUrl();
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditingMemberId(null);
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoError(undefined);
    setExistingPhotoUrl(null);
  };

  const handleFieldChange = (
    field: keyof TeamMemberFormData,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
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
    const errors = validateTeamMemberForm(formData);
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

      if (selectedPhotoFile) {
        photoUrl = await uploadTeamMemberPhoto(
          selectedPhotoFile,
          editingMemberId ?? undefined,
        );
      }

      const payload = {
        ...formDataToPayload(formData),
        photo_url: photoUrl,
      };

      if (editingMemberId) {
        const { data, error } = await supabase
          .from("team_members")
          .update(payload)
          .eq("id", editingMemberId)
          .select(MEMBER_SELECT)
          .single();

        if (error) throw new Error(error.message);

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
        resetForm();
      } else {
        const { data, error } = await supabase
          .from("team_members")
          .insert(payload)
          .select(MEMBER_SELECT)
          .single();

        if (error) throw new Error(error.message);

        setMembers((current) => [data as TeamMember, ...current]);
        resetForm();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save team member profile.";
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
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

      if (error) throw new Error(error.message);

      if (
        pendingDeleteMember.photo_url &&
        isManagedTeamMemberPhoto(pendingDeleteMember.photo_url)
      ) {
        await deleteTeamMemberPhoto(pendingDeleteMember.photo_url);
      }

      setMembers((current) =>
        current.filter((member) => member.id !== pendingDeleteMember.id),
      );

      if (editingMemberId === pendingDeleteMember.id) {
        resetForm();
      }

      setPendingDeleteMember(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete team member profile.";
      setActionError(message);
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <TeamDirectoryHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loadError ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <p className="font-medium">Unable to load team directory</p>
            <p className="mt-1">{loadError}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-3 rounded-md border border-danger/30 px-3 py-1.5 text-sm font-medium transition-colors hover:border-danger/50"
            >
              Try again
            </button>
          </div>
        ) : null}

        {actionError ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {actionError}
          </div>
        ) : null}

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
              <div
                role="status"
                aria-live="polite"
                className="rounded-lg border border-border bg-surface px-6 py-12 text-center"
              >
                <p className="text-sm text-muted">Loading team directory...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                title={
                  members.length === 0
                    ? "No team members added yet."
                    : "No members in this category."
                }
                description={
                  members.length === 0
                    ? "Create the first profile to start building the project directory."
                    : "Try another category or add a profile for this project area."
                }
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {filteredMembers.map((member) => (
                  <li key={member.id}>
                    <TeamMemberCard
                      member={member}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRequest}
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
              photoPreviewUrl={photoPreviewUrl}
              photoFileName={selectedPhotoFile?.name ?? null}
              photoError={photoError}
              isSaving={isSaving}
              isEditing={Boolean(editingMemberId)}
              onChange={handleFieldChange}
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handlePhotoRemove}
              onSubmit={() => void handleSubmit()}
              onCancel={resetForm}
            />
          </div>
        </div>
      </main>

      {pendingDeleteMember ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="presentation"
          onClick={handleDeleteCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-dialog-title"
              className="font-display text-lg text-foreground"
            >
              Delete profile
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Are you sure you want to delete this team member profile?
            </p>
            <p className="mt-3 rounded-md bg-surface-muted px-3 py-2 text-sm text-foreground">
              {pendingDeleteMember.name}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={Boolean(deletingMemberId)}
                className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={Boolean(deletingMemberId)}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
