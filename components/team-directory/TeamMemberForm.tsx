"use client";

import type { FormErrors, ProjectCategory, TeamMemberFormData } from "@/types/team-directory";

type TeamMemberFormProps = {
  categories: ProjectCategory[];
  formData: TeamMemberFormData;
  errors: FormErrors;
  photoPreviewUrl: string | null;
  photoFileName: string | null;
  photoError?: string;
  isSaving: boolean;
  isEditing: boolean;
  onChange: (field: keyof TeamMemberFormData, value: string) => void;
  onPhotoSelect: (file: File | null) => void;
  onPhotoRemove: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function SavingLabel({
  isSaving,
  isEditing,
  hasPhotoUpload,
}: {
  isSaving: boolean;
  isEditing: boolean;
  hasPhotoUpload: boolean;
}) {
  if (!isSaving) {
    return isEditing ? "Save changes" : "Create profile";
  }

  if (hasPhotoUpload) {
    return isEditing ? "Uploading and saving..." : "Uploading and creating...";
  }

  return isEditing ? "Saving changes..." : "Creating profile...";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors",
    hasError
      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
      : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20",
  ].join(" ");
}

export function TeamMemberForm({
  categories,
  formData,
  errors,
  photoPreviewUrl,
  photoFileName,
  photoError,
  isSaving,
  isEditing,
  onChange,
  onPhotoSelect,
  onPhotoRemove,
  onSubmit,
  onCancel,
}: TeamMemberFormProps) {
  const hasPhotoUpload = Boolean(photoFileName);
  return (
    <section
      aria-labelledby="member-form-heading"
      className="rounded-lg border border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="member-form-heading"
            className="font-display text-xl text-foreground"
          >
            {isEditing ? "Edit team member" : "Add team member"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Required fields are marked. Optional details help teammates find you.
          </p>
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="self-start rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-50"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(event) => onChange("name", event.target.value)}
            className={inputClass(Boolean(errors.name))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
            Role <span className="text-danger">*</span>
          </label>
          <input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={(event) => onChange("role", event.target.value)}
            className={inputClass(Boolean(errors.role))}
            aria-invalid={Boolean(errors.role)}
          />
          <FieldError message={errors.role} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="project_category_id"
            className="mb-1.5 block text-sm font-medium"
          >
            Project category <span className="text-danger">*</span>
          </label>
          <select
            id="project_category_id"
            name="project_category_id"
            value={formData.project_category_id}
            onChange={(event) =>
              onChange("project_category_id", event.target.value)
            }
            className={inputClass(Boolean(errors.project_category_id))}
            aria-invalid={Boolean(errors.project_category_id)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.project_category_id} />
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Profile photo</span>
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {photoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreviewUrl}
                  alt="Selected profile photo preview"
                  className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-surface-muted text-xs text-muted">
                  No photo
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-2">
                <label
                  htmlFor="photo"
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted"
                >
                  {photoPreviewUrl ? "Replace photo" : "Upload photo"}
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isSaving}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    onPhotoSelect(file);
                    event.target.value = "";
                  }}
                />
                <p className="text-xs text-muted">
                  JPG, PNG, WebP, or GIF. Max 5 MB.
                  {photoFileName ? ` Selected: ${photoFileName}` : null}
                </p>
                {photoPreviewUrl ? (
                  <button
                    type="button"
                    onClick={onPhotoRemove}
                    disabled={isSaving}
                    className="text-xs font-medium text-danger underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <FieldError message={photoError} />
        </div>

        <div>
          <label
            htmlFor="project_assignment"
            className="mb-1.5 block text-sm font-medium"
          >
            Project assignment
          </label>
          <input
            id="project_assignment"
            name="project_assignment"
            type="text"
            value={formData.project_assignment}
            onChange={(event) =>
              onChange("project_assignment", event.target.value)
            }
            className={inputClass(false)}
          />
        </div>

        <div>
          <label
            htmlFor="favorite_stack"
            className="mb-1.5 block text-sm font-medium"
          >
            Favorite tech stack
          </label>
          <input
            id="favorite_stack"
            name="favorite_stack"
            type="text"
            value={formData.favorite_stack}
            onChange={(event) => onChange("favorite_stack", event.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div>
          <label
            htmlFor="current_focus"
            className="mb-1.5 block text-sm font-medium"
          >
            Current focus
          </label>
          <input
            id="current_focus"
            name="current_focus"
            type="text"
            value={formData.current_focus}
            onChange={(event) => onChange("current_focus", event.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div>
          <label
            htmlFor="learning_goal"
            className="mb-1.5 block text-sm font-medium"
          >
            Learning goal
          </label>
          <input
            id="learning_goal"
            name="learning_goal"
            type="text"
            value={formData.learning_goal}
            onChange={(event) => onChange("learning_goal", event.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="fun_fact" className="mb-1.5 block text-sm font-medium">
            Fun fact
          </label>
          <input
            id="fun_fact"
            name="fun_fact"
            type="text"
            value={formData.fun_fact}
            onChange={(event) => onChange("fun_fact", event.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="profile_url"
            className="mb-1.5 block text-sm font-medium"
          >
            GitHub or LinkedIn profile URL
          </label>
          <input
            id="profile_url"
            name="profile_url"
            type="url"
            inputMode="url"
            placeholder="https://github.com/..."
            value={formData.profile_url}
            onChange={(event) => onChange("profile_url", event.target.value)}
            className={inputClass(Boolean(errors.profile_url))}
            aria-invalid={Boolean(errors.profile_url)}
          />
          <FieldError message={errors.profile_url} />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SavingLabel
              isSaving={isSaving}
              isEditing={isEditing}
              hasPhotoUpload={hasPhotoUpload}
            />
          </button>
        </div>
      </form>
    </section>
  );
}
