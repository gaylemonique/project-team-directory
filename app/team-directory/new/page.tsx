import { TeamDirectoryView } from "@/components/team-directory/TeamDirectoryView";

type NewMemberPageProps = {
  searchParams: Promise<{ category?: string; edit?: string }>;
};

export default async function NewMemberPage({ searchParams }: NewMemberPageProps) {
  const { category, edit } = await searchParams;

  return (
    <TeamDirectoryView
      mode="form"
      initialCategoryId={category ?? null}
      initialMemberId={edit ?? null}
    />
  );
}
