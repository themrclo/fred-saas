import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const body = await req.json();
  const schema = z.object({
    criterionId: z.string(),
    alternativeId: z.string(),
    value: z.number().min(0).max(5),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { criterionId, alternativeId, value } = parsed.data;
  const score = await prisma.score.upsert({
    where: {
      criterionId_alternativeId: { criterionId, alternativeId },
    },
    update: { value },
    create: { criterionId, alternativeId, value },
  });
  return NextResponse.json(score);
}
