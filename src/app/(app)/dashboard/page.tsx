import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fredStageLabel } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus projetos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Olá, {session.user.name || "estudante"}. Continue um ciclo FrEDzinho ou comece um novo.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tutorial">
            <Button variant="secondary">Caso tutorial</Button>
          </Link>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              Novo projeto
            </Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum projeto ainda</CardTitle>
            <CardDescription>
              Crie um projeto em branco ou abra o caso tutorial da Equipe Athena.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/projects/new">
              <Button>Criar projeto</Button>
            </Link>
            <Link href="/tutorial">
              <Button variant="secondary">Abrir tutorial</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block group">
              <Card className="h-full transition group-hover:border-indigo-200 group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    {p.isTutorial && (
                      <span className="text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        Tutorial
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {p.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-slate-500">
                  <span>{fredStageLabel(p.stage)}</span>
                  <span>
                    {p.updatedAt.toLocaleDateString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
