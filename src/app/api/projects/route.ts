import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { whyNodes: true, howNodes: true, criteria: true, alternatives: true } },
    },
  });
  return NextResponse.json(projects);
}

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Título inválido" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || "",
      userId: session.user.id,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
