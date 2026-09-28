type ExportInput = {
  title: string;
  description: string;
  hero: string;
  treasure: string;
  dragon: string;
  quest: string;
  ruleClarity: boolean;
  ruleOwnership: boolean;
  ruleValue: boolean;
  ruleObstacle: boolean;
  stage: string;
  whyNodes: { id: string; parentId: string | null; content: string; sortOrder: number }[];
  howNodes: { id: string; parentId: string | null; content: string; sortOrder: number }[];
  criteria: { id: string; name: string; weight: number }[];
  alternatives: { id: string; name: string }[];
  scores: { criterionId: string; alternativeId: string; value: number }[];
};

function treeMarkdown(
  nodes: { id: string; parentId: string | null; content: string; sortOrder: number }[],
  parentId: string | null = null,
  depth = 0
): string {
  const kids = nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return kids
    .map((n) => {
      const indent = "  ".repeat(depth);
      const line = `${indent}- ${n.content.trim() || "(vazio)"}`;
      const child = treeMarkdown(nodes, n.id, depth + 1);
      return child ? `${line}\n${child}` : line;
    })
    .join("\n");
}

export function projectToMarkdown(p: ExportInput): string {
  const check = (v: boolean) => (v ? "[x]" : "[ ]");

  const ranking = p.alternatives.map((alt) => {
    let total = 0;
    let weightSum = 0;
    for (const c of p.criteria) {
      const score = p.scores.find(
        (s) => s.criterionId === c.id && s.alternativeId === alt.id
      );
      const v = score?.value ?? 0;
      total += v * c.weight;
      weightSum += c.weight;
    }
    const weighted = weightSum > 0 ? total / weightSum : 0;
    return { name: alt.name, weighted, total };
  });
  ranking.sort((a, b) => b.weighted - a.weighted);

  const lines = [
    `# Cartão FrEDzinho — ${p.title}`,
    "",
    p.description ? `> ${p.description}\n` : "",
    `**Estágio do ciclo:** ${p.stage}`,
    "",
    "## 1. Enquadrar (Frame)",
    "",
    `**Herói:** ${p.hero || "—"}`,
    `**Tesouro:** ${p.treasure || "—"}`,
    `**Dragão:** ${p.dragon || "—"}`,
    `**Missão:** ${p.quest || "—"}`,
    "",
    "### Checklist das 4 regras",
    `- ${check(p.ruleClarity)} Clareza do desafio`,
    `- ${check(p.ruleOwnership)} Protagonismo definido`,
    `- ${check(p.ruleValue)} Valor desejado explícito`,
    `- ${check(p.ruleObstacle)} Obstáculo concreto`,
    "",
    "## 2. Explorar (Explore)",
    "",
    "### Mapa do Porquê",
    treeMarkdown(p.whyNodes) || "- (ainda sem nós)",
    "",
    "### Mapa do Como",
    treeMarkdown(p.howNodes) || "- (ainda sem nós)",
    "",
    "## 3. Decidir (Decide)",
    "",
    "### Critérios e pesos",
    ...(p.criteria.length
      ? p.criteria.map((c) => `- ${c.name} (peso ${c.weight})`)
      : ["- (nenhum)"]),
    "",
    "### Alternativas",
    ...(p.alternatives.length
      ? p.alternatives.map((a) => `- ${a.name}`)
      : ["- (nenhuma)"]),
    "",
    "### Ranking (média ponderada)",
    ...ranking.map(
      (r, i) => `${i + 1}. **${r.name}** — ${r.weighted.toFixed(2)} (soma ponderada ${r.total.toFixed(2)})`
    ),
    "",
    "---",
    `_Gerado pelo FrEDzinho · Unimontes · ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}_`,
    "",
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}
