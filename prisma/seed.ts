import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("demo1234", 10);

  const professor = await prisma.user.upsert({
    where: { email: "professor@unimontes.br" },
    update: {},
    create: {
      name: "Prof. Ana Oliveira",
      email: "professor@unimontes.br",
      passwordHash,
    },
  });

  const aluno = await prisma.user.upsert({
    where: { email: "aluno@unimontes.br" },
    update: {},
    create: {
      name: "Marcelo Caetano Melo",
      email: "aluno@unimontes.br",
      passwordHash,
    },
  });

  const existing = await prisma.project.findFirst({
    where: { userId: aluno.id, isTutorial: true },
  });

  if (!existing) {
    const tutorial = await prisma.project.create({
      data: {
        title: "Equipe Athena — Feira de Ciências",
        description:
          "Caso tutorial original: três estudantes da Unimontes precisam escolher como apresentar um projeto interdisciplinar na Feira de Ciências do campus, com prazo curto e orçamento limitado.",
        userId: aluno.id,
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

    const whyRoot = await prisma.whyNode.create({
      data: {
        projectId: tutorial.id,
        content: "Por que precisamos decidir o formato agora?",
        sortOrder: 0,
      },
    });
    await prisma.whyNode.createMany({
      data: [
        {
          projectId: tutorial.id,
          parentId: whyRoot.id,
          content: "Porque a inscrição na feira fecha em 10 dias",
          sortOrder: 0,
        },
        {
          projectId: tutorial.id,
          parentId: whyRoot.id,
          content: "Porque o material precisa ser produzido com o orçamento disponível",
          sortOrder: 1,
        },
      ],
    });

    const howRoot = await prisma.howNode.create({
      data: {
        projectId: tutorial.id,
        content: "Como podemos comunicar o projeto com impacto?",
        sortOrder: 0,
      },
    });
    await prisma.howNode.createMany({
      data: [
        {
          projectId: tutorial.id,
          parentId: howRoot.id,
          content: "Com um pôster científico impresso",
          sortOrder: 0,
        },
        {
          projectId: tutorial.id,
          parentId: howRoot.id,
          content: "Com uma maquete interativa de baixo custo",
          sortOrder: 1,
        },
        {
          projectId: tutorial.id,
          parentId: howRoot.id,
          content: "Com um vídeo curto + estande mínimo",
          sortOrder: 2,
        },
      ],
    });

    const c1 = await prisma.criterion.create({
      data: { projectId: tutorial.id, name: "Clareza para a banca", weight: 3, sortOrder: 0 },
    });
    const c2 = await prisma.criterion.create({
      data: { projectId: tutorial.id, name: "Custo total", weight: 2, sortOrder: 1 },
    });
    const c3 = await prisma.criterion.create({
      data: { projectId: tutorial.id, name: "Tempo de produção", weight: 2, sortOrder: 2 },
    });
    const c4 = await prisma.criterion.create({
      data: { projectId: tutorial.id, name: "Engajamento do público", weight: 3, sortOrder: 3 },
    });

    const a1 = await prisma.alternative.create({
      data: { projectId: tutorial.id, name: "Pôster impresso", sortOrder: 0 },
    });
    const a2 = await prisma.alternative.create({
      data: { projectId: tutorial.id, name: "Maquete interativa", sortOrder: 1 },
    });
    const a3 = await prisma.alternative.create({
      data: { projectId: tutorial.id, name: "Vídeo + estande mínimo", sortOrder: 2 },
    });

    // scores 1-5
    const matrix: [string, string, number][] = [
      [c1.id, a1.id, 4],
      [c1.id, a2.id, 3],
      [c1.id, a3.id, 5],
      [c2.id, a1.id, 5],
      [c2.id, a2.id, 2],
      [c2.id, a3.id, 4],
      [c3.id, a1.id, 5],
      [c3.id, a2.id, 2],
      [c3.id, a3.id, 3],
      [c4.id, a1.id, 2],
      [c4.id, a2.id, 5],
      [c4.id, a3.id, 4],
    ];
    await prisma.score.createMany({
      data: matrix.map(([criterionId, alternativeId, value]) => ({
        criterionId,
        alternativeId,
        value,
      })),
    });

    console.log("Tutorial criado:", tutorial.id);
  }

  console.log("Seed OK");
  console.log("Usuários: professor@unimontes.br / aluno@unimontes.br");
  console.log("Senha: demo1234");
  console.log("IDs:", { professor: professor.id, aluno: aluno.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
