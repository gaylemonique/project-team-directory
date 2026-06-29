import { ProjectMembersView } from "@/components/projects/ProjectMembersView";

type ProjectPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { categoryId } = await params;

  return <ProjectMembersView categoryId={categoryId} />;
}
