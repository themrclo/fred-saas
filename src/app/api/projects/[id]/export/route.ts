import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectToMarkdown } from "@/lib/export-markdown";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
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
  if (!project) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const scores = await prisma.score.findMany({
    where: {
      criterionId: { in: project.criteria.map((c) => c.id) },
    },
  });
  const md = projectToMarkdown({
    ...project,
    scores,
  });
  const filename = `fred-${project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .slice(0, 40)}.md`;
  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
