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
  const schema = z.object({
    name: z.string().min(1),
    weight: z.number().min(0.1).max(10).default(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const count = await prisma.criterion.count({ where: { projectId: id } });
  const criterion = await prisma.criterion.create({
    data: {
      projectId: id,
      name: parsed.data.name,
      weight: parsed.data.weight,
      sortOrder: count,
    },
  });
  const alts = await prisma.alternative.findMany({ where: { projectId: id } });
  if (alts.length) {
    await prisma.score.createMany({
      data: alts.map((a) => ({
        criterionId: criterion.id,
        alternativeId: a.id,
        value: 0,
      })),
    });
  }
  return NextResponse.json(criterion, { status: 201 });
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
    criterionId: z.string(),
    name: z.string().min(1).optional(),
    weight: z.number().min(0.1).max(10).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { criterionId, ...data } = parsed.data;
  await prisma.criterion.updateMany({
    where: { id: criterionId, projectId: id },
    data,
  });
  const updated = await prisma.criterion.findUnique({ where: { id: criterionId } });
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
  const criterionId = searchParams.get("criterionId");
  if (!criterionId) {
    return NextResponse.json({ error: "criterionId obrigatório" }, { status: 400 });
  }
  await prisma.criterion.deleteMany({ where: { id: criterionId, projectId: id } });
  return NextResponse.json({ ok: true });
}
