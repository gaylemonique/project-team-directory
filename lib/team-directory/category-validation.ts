import type { ProjectCategory } from "@/types/team-directory";

export type ProjectCategoryFormData = {
  name: string;
  description: string;
  team_lead: string;
};

export type ProjectCategoryFormErrors = Partial<
  Record<keyof ProjectCategoryFormData, string>
>;

export const EMPTY_CATEGORY_FORM: ProjectCategoryFormData = {
  name: "",
  description: "",
  team_lead: "",
};

export function categoryToFormData(
  category: ProjectCategory,
): ProjectCategoryFormData {
  return {
    name: category.name,
    description: category.description ?? "",
    team_lead: category.team_lead ?? "",
  };
}

export function validateProjectCategoryForm(
  data: ProjectCategoryFormData,
): ProjectCategoryFormErrors {
  const errors: ProjectCategoryFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Category name is required.";
  }

  return errors;
}

export function formDataToCategoryPayload(data: ProjectCategoryFormData) {
  return {
    name: data.name.trim(),
    description: data.description.trim() || null,
    team_lead: data.team_lead.trim() || null,
  };
}
