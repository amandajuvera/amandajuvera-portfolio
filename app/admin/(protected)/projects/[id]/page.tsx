import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <>
      <div className="admin__head">
        <h1>Edit project</h1>
      </div>
      <ProjectForm project={project} />
    </>
  );
}
