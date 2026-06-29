export type ProjectCategory = {
  id: string;
  name: string;
  description: string | null;
  team_lead: string | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  project_category_id: string | null;
  name: string;
  role: string;
  photo_url: string | null;
  project_assignment: string | null;
  favorite_stack: string | null;
  current_focus: string | null;
  learning_goal: string | null;
  fun_fact: string | null;
  profile_url: string | null;
  created_at: string;
  updated_at: string;
  project_categories: ProjectCategory | null;
};

export type TeamMemberFormData = {
  name: string;
  role: string;
  project_category_id: string;
  photo_url: string;
  project_assignment: string;
  favorite_stack: string;
  current_focus: string;
  learning_goal: string;
  fun_fact: string;
  profile_url: string;
};

export type FormErrors = Partial<Record<keyof TeamMemberFormData, string>>;

export const EMPTY_FORM: TeamMemberFormData = {
  name: "",
  role: "",
  project_category_id: "",
  photo_url: "",
  project_assignment: "",
  favorite_stack: "",
  current_focus: "",
  learning_goal: "",
  fun_fact: "",
  profile_url: "",
};

export const FILTER_ALL = "all";

export type CategoryFilterValue = typeof FILTER_ALL | string;
