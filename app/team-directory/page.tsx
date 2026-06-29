import { TeamDirectoryView } from "@/components/team-directory/TeamDirectoryView";

type TeamDirectoryPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function TeamDirectoryPage({
  searchParams,
}: TeamDirectoryPageProps) {
  const { category } = await searchParams;

  return <TeamDirectoryView initialCategoryId={category ?? null} />;
}
