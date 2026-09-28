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
    content: z.string().default(""),
    parentId: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const count = await prisma.whyNode.count({
    where: { projectId: id, parentId: parsed.data.parentId ?? null },
  });
  const node = await prisma.whyNode.create({
    data: {
      projectId: id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
      sortOrder: count,
    },
  });
  return NextResponse.json(node, { status: 201 });
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
    nodeId: z.string(),
    content: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const node = await prisma.whyNode.updateMany({
    where: { id: parsed.data.nodeId, projectId: id },
    data: { content: parsed.data.content },
  });
  if (node.count === 0) {
    return NextResponse.json({ error: "Nó não encontrado" }, { status: 404 });
  }
  const updated = await prisma.whyNode.findUnique({ where: { id: parsed.data.nodeId } });
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
  const nodeId = searchParams.get("nodeId");
  if (!nodeId) {
    return NextResponse.json({ error: "nodeId obrigatório" }, { status: 400 });
  }
  await prisma.whyNode.deleteMany({ where: { id: nodeId, projectId: id } });
  return NextResponse.json({ ok: true });
}
