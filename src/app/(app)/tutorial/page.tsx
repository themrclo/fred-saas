import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TutorialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let tutorial = await prisma.project.findFirst({
    where: { userId: session.user.id, isTutorial: true },
  });

  if (!tutorial) {
    tutorial = await prisma.project.create({
      data: {
        title: "Equipe Athena — Feira de Ciências",
        description:
          "Caso tutorial original: três estudantes da Unimontes precisam escolher como apresentar um projeto interdisciplinar na Feira de Ciências do campus, com prazo curto e orçamento limitado.",
        userId: session.user.id,
        isTutorial: true,
        hero: "Equipe Athena (Lia, Bruno e Marina), estudantes de cursos diferentes na Unimontes",
        treasure:
          "Uma apresentação clara, memorável e viável que comunique o impacto do projeto à banca e ao público do campus",
        dragon:
          "Prazo de 10 dias, orçamento de R$ 200 e falta de consenso sobre o formato da apresentação",
        quest:
          "Escolher o formato de apresentação que maximize clareza e impacto dentro das restrições de tempo e dinheiro",
        ruleClarity: true,
        ruleOwnership: true,
        ruleValue: true,
        ruleObstacle: true,
        stage: "frame",
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Caso tutorial guiado</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ficção original criada para esta disciplina — não deriva de livros comerciais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipe Athena — Feira de Ciências</CardTitle>
          <CardDescription>
            Lia (Biologia), Bruno (Engenharia) e Marina (Design) formaram a Equipe Athena para
            apresentar um sensor de qualidade da água em nascentes periurbanas. A Feira de
            Ciências da Unimontes abre inscrição em 10 dias. Eles têm R$ 200 e discordam do
            formato: pôster, maquete ou vídeo com estande mínimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Enquadrar:</strong> revise herói, tesouro, dragão, missão e as 4 regras.
            </li>
            <li>
              <strong>Explorar:</strong> complete o Mapa do Porquê (prazos, orçamento) e o Mapa
              do Como (três formatos).
            </li>
            <li>
              <strong>Decidir:</strong> use critérios (clareza, custo, tempo, engajamento) e a
              matriz para ranquear.
            </li>
            <li>
              <strong>Exportar:</strong> baixe o cartão Markdown para entregar ao professor.
            </li>
          </ol>
          <Link href={`/projects/${tutorial.id}`}>
            <Button>Abrir caso no FrEDzinho</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
