import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/utils";
import { ProjectNav } from "@/components/project-nav";
import { FredStatusPanel } from "@/components/fred-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/delete-project-button";

export default async function ProjectOverviewPage({
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {project.description || "Sem descrição"}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/projects/${project.id}/export`}>
            <Button variant="secondary">Exportar Markdown</Button>
          </a>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      <ProjectNav projectId={project.id} />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo do enquadramento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">Herói</p>
                <p className="text-slate-800">{project.hero || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tesouro</p>
                <p className="text-slate-800">{project.treasure || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Dragão</p>
                <p className="text-slate-800">{project.dragon || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Missão</p>
                <p className="text-slate-800">{project.quest || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Link href={`/projects/${project.id}/frame`}>
              <Button>Abrir Enquadrar</Button>
            </Link>
            <Link href={`/projects/${project.id}/why`}>
              <Button variant="secondary">Mapa do Porquê</Button>
            </Link>
            <Link href={`/projects/${project.id}/how`}>
              <Button variant="secondary">Mapa do Como</Button>
            </Link>
            <Link href={`/projects/${project.id}/decide`}>
              <Button variant="secondary">Decidir</Button>
            </Link>
          </div>
        </div>
        <FredStatusPanel stage={project.stage} progress={progress} />
      </div>
    </div>
  );
}
