import type { ProjectCategory } from "@/types/team-directory";

export type ProjectCategoryFormData = {
  name: string;
  description: string;
  team_lead: string;
  website_url: string;
};

export type ProjectCategoryFormErrors = Partial<
  Record<keyof ProjectCategoryFormData, string>
>;

export const EMPTY_CATEGORY_FORM: ProjectCategoryFormData = {
  name: "",
  description: "",
  team_lead: "",
  website_url: "",
};

function isValidWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatWebsiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export type ProjectCategorySortOrder = "latest" | "oldest";

export function sortProjectCategoriesByCreatedAt(
  categories: ProjectCategory[],
  order: ProjectCategorySortOrder = "latest",
): ProjectCategory[] {
  return [...categories].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
    const timeDiff = safeBTime - safeATime;

    if (timeDiff !== 0) {
      return order === "latest" ? timeDiff : -timeDiff;
    }

    return a.name.localeCompare(b.name);
  });
}

export function categoryToFormData(
  category: ProjectCategory,
): ProjectCategoryFormData {
  return {
    name: category.name,
    description: category.description ?? "",
    team_lead: category.team_lead ?? "",
    website_url: category.website_url ?? "",
  };
}

export function validateProjectCategoryForm(
  data: ProjectCategoryFormData,
): ProjectCategoryFormErrors {
  const errors: ProjectCategoryFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Project name is required.";
  }

  if (data.website_url.trim() && !isValidWebsiteUrl(data.website_url.trim())) {
    errors.website_url = "Enter a valid website URL (http or https).";
  }

  return errors;
}

export function formDataToCategoryPayload(data: ProjectCategoryFormData) {
  return {
    name: data.name.trim(),
    description: data.description.trim() || null,
    team_lead: data.team_lead.trim() || null,
    website_url: data.website_url.trim() || null,
  };
}
