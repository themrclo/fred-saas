import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/utils";
import { ProjectNav } from "@/components/project-nav";
import { FredStatusPanel } from "@/components/fred-status";
import { FrameStudio } from "@/components/frame/frame-studio";

export default async function FramePage({
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
      criteria: true,
      alternatives: true,
    },
  });
  if (!project) notFound();
  const scores = await prisma.score.findMany({
    where: { criterionId: { in: project.criteria.map((c) => c.id) } },
  });
  const progress = computeProgress({ ...project, scores });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estúdio de Enquadramento</h1>
        <p className="text-sm text-slate-500 mt-1">{project.title}</p>
      </div>
      <ProjectNav projectId={project.id} />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <FrameStudio
          projectId={project.id}
          initial={{
            hero: project.hero,
            treasure: project.treasure,
            dragon: project.dragon,
            quest: project.quest,
            ruleClarity: project.ruleClarity,
            ruleOwnership: project.ruleOwnership,
            ruleValue: project.ruleValue,
            ruleObstacle: project.ruleObstacle,
          }}
        />
        <FredStatusPanel stage={project.stage} progress={progress} />
      </div>
    </div>
  );
}
