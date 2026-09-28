import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  hero: z.string().optional(),
  treasure: z.string().optional(),
  dragon: z.string().optional(),
  quest: z.string().optional(),
  ruleClarity: z.boolean().optional(),
  ruleOwnership: z.boolean().optional(),
  ruleValue: z.boolean().optional(),
  ruleObstacle: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(project);
}
