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
    return "This change could not be saved because the update was blocked. Check Supabase row-level security policies.";
  }

  if (error.code === "23505") {
    return "That name is already in use. Choose a different project name.";
  }

  if (error.code === "42501") {
    return "You do not have permission to perform this action.";
  }

  return error.message || fallback;
}
