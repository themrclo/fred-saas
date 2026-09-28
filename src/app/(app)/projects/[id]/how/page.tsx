import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/utils";
import { ProjectNav } from "@/components/project-nav";
import { FredStatusPanel } from "@/components/fred-status";
import { TreeEditor } from "@/components/maps/tree-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HowPage({
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
      howNodes: { orderBy: { sortOrder: "asc" } },
      criteria: true,
      alternatives: true,
    },
  });
  if (!project) notFound();
  const scores = await prisma.score.findMany({
    where: { criterionId: { in: project.criteria.map((c) => c.id) } },
  });
  const progress = computeProgress({ ...project, scores });

  if (project.stage === "frame") {
    await prisma.project.update({ where: { id }, data: { stage: "explore" } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mapa do Como</h1>
        <p className="text-sm text-slate-500 mt-1">{project.title}</p>
      </div>
      <ProjectNav projectId={project.id} />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Como podemos avançar?</CardTitle>
            <CardDescription>
              Desdobre caminhos e ações possíveis. Use a árvore para gerar alternativas
              que depois entrarão na matriz de decisão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeEditor
              projectId={project.id}
              kind="how"
              nodes={project.howNodes}
              rootPrompt="Como…?"
            />
          </CardContent>
        </Card>
        <FredStatusPanel stage="explore" progress={progress} />
      </div>
    </div>
  );
}
