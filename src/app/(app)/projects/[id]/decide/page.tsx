import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/utils";
import { ProjectNav } from "@/components/project-nav";
import { FredStatusPanel } from "@/components/fred-status";
import { DecisionMatrix } from "@/components/decide/decision-matrix";

export default async function DecidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      whyNodes: true,
      howNodes: true,
      criteria: { orderBy: { sortOrder: "asc" } },
      alternatives: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();

  const scores = await prisma.score.findMany({
    where: { criterionId: { in: project.criteria.map((c) => c.id) } },
  });
  const progress = computeProgress({ ...project, scores });

  if (project.stage !== "decide" && project.stage !== "done") {
    await prisma.project.update({ where: { id }, data: { stage: "decide" } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Decidir</h1>
        <p className="text-sm text-slate-500 mt-1">{project.title}</p>
      </div>
      <ProjectNav projectId={project.id} />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <DecisionMatrix
          projectId={project.id}
          criteria={project.criteria}
          alternatives={project.alternatives}
          scores={scores}
        />
        <FredStatusPanel stage="decide" progress={progress} />
      </div>
    </div>
  );
}
