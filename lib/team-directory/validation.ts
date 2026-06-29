import type { FormErrors, TeamMemberFormData } from "@/types/team-directory";
import { ADD_NEW_CATEGORY } from "@/types/team-directory";

function isValidGitHubUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "github.com" || host === "www.github.com";
  } catch {
    return false;
  }
}

export function validateTeamMemberForm(
  data: TeamMemberFormData,
  options?: { newCategoryName?: string },
): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!data.role.trim()) {
    errors.role = "Role is required.";
  }

  if (data.project_category_id === ADD_NEW_CATEGORY) {
    if (!options?.newCategoryName?.trim()) {
      errors.new_category_name = "Category name is required.";
    }
  } else if (!data.project_category_id) {
    errors.project_category_id = "Project category is required.";
  }

  if (data.profile_url.trim() && !isValidGitHubUrl(data.profile_url.trim())) {
    errors.profile_url = "Enter a valid GitHub profile URL.";
  }

  return errors;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function memberToFormData(
  member: import("@/types/team-directory").TeamMember,
): TeamMemberFormData {
  return {
    name: member.name,
    role: member.role,
    project_category_id: member.project_category_id ?? "",
    photo_url: member.photo_url ?? "",
    project_assignment: member.project_assignment ?? "",
    favorite_stack: member.favorite_stack ?? "",
    current_focus: member.current_focus ?? "",
    learning_goal: member.learning_goal ?? "",
    fun_fact: member.fun_fact ?? "",
    profile_url: member.profile_url ?? "",
  };
}

export function formDataToPayload(data: TeamMemberFormData) {
  return {
    name: data.name.trim(),
    role: data.role.trim(),
    project_category_id: data.project_category_id,
    photo_url: data.photo_url.trim() || null,
    project_assignment: data.project_assignment.trim() || null,
    favorite_stack: data.favorite_stack.trim() || null,
    current_focus: data.current_focus.trim() || null,
    learning_goal: data.learning_goal.trim() || null,
    fun_fact: data.fun_fact.trim() || null,
    profile_url: data.profile_url.trim() || null,
    updated_at: new Date().toISOString(),
  };
}
