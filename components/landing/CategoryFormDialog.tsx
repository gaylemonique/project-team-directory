"use client";

import type {
  ProjectCategoryFormData,
  ProjectCategoryFormErrors,
} from "@/lib/team-directory/category-validation";

type CategoryFormDialogProps = {
  mode: "add" | "edit";
  formData: ProjectCategoryFormData;
  errors: ProjectCategoryFormErrors;
  isSaving: boolean;
  onChange: (field: keyof ProjectCategoryFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function inputClass(hasError: boolean) {
  return [
    "interactive w-full rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground outline-none",
    hasError
      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
      : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20",
  ].join(" ");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  );
}

export function CategoryFormDialog({
  mode,
  formData,
  errors,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: CategoryFormDialogProps) {
  const title = mode === "add" ? "Add a project" : "Edit project";
  const description =
    mode === "add"
      ? "Create a new project area for organizing team member profiles."
      : "Update this project area's details.";
  const submitLabel = mode === "add" ? "Add project" : "Save changes";
  const savingLabel = mode === "add" ? "Adding..." : "Saving...";

  return (
    <div
      className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-dialog-title"
        className="animate-scale-in w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="category-form-dialog-title"
          className="font-display text-xl text-foreground"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium">
              Project name <span className="text-danger">*</span>
            </label>
            <input
              id="category-name"
              name="category-name"
              type="text"
              value={formData.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. Platform Engineering"
              className={inputClass(Boolean(errors.name))}
              aria-invalid={Boolean(errors.name)}
              autoFocus
              disabled={isSaving}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-1.5 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="category-description"
              name="category-description"
              rows={3}
              value={formData.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="What this project area covers"
              className={inputClass(false)}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="category-team-lead" className="mb-1.5 block text-sm font-medium">
              Team lead
            </label>
            <input
              id="category-team-lead"
              name="category-team-lead"
              type="text"
              value={formData.team_lead}
              onChange={(event) => onChange("team_lead", event.target.value)}
              placeholder="Optional"
              className={inputClass(false)}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="category-website-url" className="mb-1.5 block text-sm font-medium">
              Website
            </label>
            <input
              id="category-website-url"
              name="category-website-url"
              type="url"
              value={formData.website_url}
              onChange={(event) => onChange("website_url", event.target.value)}
              placeholder="https://example.com"
              className={inputClass(Boolean(errors.website_url))}
              aria-invalid={Boolean(errors.website_url)}
              disabled={isSaving}
            />
            <FieldError message={errors.website_url} />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="interactive rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="interactive inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 animate-spin-slow rounded-full border-2 border-white/30 border-t-white"
                  />
                  {savingLabel}
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
