import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard(id: string, userId: string) {
  return prisma.project.findFirst({ where: { id, userId } });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await guard(id, session.user.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const body = await req.json();
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const count = await prisma.alternative.count({ where: { projectId: id } });
  const alternative = await prisma.alternative.create({
    data: {
      projectId: id,
      name: parsed.data.name,
      sortOrder: count,
    },
  });
  const criteria = await prisma.criterion.findMany({ where: { projectId: id } });
  if (criteria.length) {
    await prisma.score.createMany({
      data: criteria.map((c) => ({
        criterionId: c.id,
        alternativeId: alternative.id,
        value: 0,
      })),
    });
  }
  return NextResponse.json(alternative, { status: 201 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await guard(id, session.user.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const body = await req.json();
  const schema = z.object({
    alternativeId: z.string(),
    name: z.string().min(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  await prisma.alternative.updateMany({
    where: { id: parsed.data.alternativeId, projectId: id },
    data: { name: parsed.data.name },
  });
  const updated = await prisma.alternative.findUnique({
    where: { id: parsed.data.alternativeId },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await guard(id, session.user.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const alternativeId = searchParams.get("alternativeId");
  if (!alternativeId) {
    return NextResponse.json({ error: "alternativeId obrigatório" }, { status: 400 });
  }
  await prisma.alternative.deleteMany({
    where: { id: alternativeId, projectId: id },
  });
  return NextResponse.json({ ok: true });
}
