import { getSupabaseClient } from "@/lib/supabase/client";

export const TEAM_MEMBER_PHOTOS_BUCKET = "team-member-photos";

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function validatePhotoFile(file: File | null): string | undefined {
  if (!file) return undefined;

  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    return "Upload a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return undefined;
}

function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function getStoragePathFromPhotoUrl(photoUrl: string): string | null {
  const marker = `/storage/v1/object/public/${TEAM_MEMBER_PHOTOS_BUCKET}/`;
  const index = photoUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(photoUrl.slice(index + marker.length));
}

export function isManagedTeamMemberPhoto(photoUrl: string | null): boolean {
  if (!photoUrl) return false;
  return getStoragePathFromPhotoUrl(photoUrl) !== null;
}

export async function uploadTeamMemberPhoto(
  file: File,
  memberId?: string,
): Promise<string> {
  const supabase = getSupabaseClient();
  const folder = memberId ?? crypto.randomUUID();
  const path = `${folder}/${Date.now()}.${getFileExtension(file)}`;

  const { error } = await supabase.storage
    .from(TEAM_MEMBER_PHOTOS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(TEAM_MEMBER_PHOTOS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteTeamMemberPhoto(photoUrl: string): Promise<void> {
  const path = getStoragePathFromPhotoUrl(photoUrl);
  if (!path) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(TEAM_MEMBER_PHOTOS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
