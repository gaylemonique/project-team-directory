type SupabaseLikeError = {
  message: string;
  code?: string;
  details?: string;
};

export function getSupabaseErrorMessage(
  error: SupabaseLikeError,
  fallback: string,
): string {
  if (error.code === "PGRST116") {
    return "This profile could not be saved because the update was blocked. Check Supabase row-level security policies for team_members.";
  }

  if (error.code === "42501") {
    return "You do not have permission to perform this action.";
  }

  return error.message || fallback;
}
