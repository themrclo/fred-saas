import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fredStageLabel(stage: string): string {
  switch (stage) {
    case "frame":
      return "Enquadrar";
    case "explore":
      return "Explorar";
    case "decide":
      return "Decidir";
    case "done":
      return "Concluído";
    default:
      return stage;
  }
}

export type FredProgress = {
  frame: number;
  explore: number;
  decide: number;
  overall: number;
};

export function computeProgress(project: {
  hero: string;
  treasure: string;
  dragon: string;
  quest: string;
  ruleClarity: boolean;
  ruleOwnership: boolean;
  ruleValue: boolean;
  ruleObstacle: boolean;
  whyNodes: { content: string }[];
  howNodes: { content: string }[];
  criteria: { name: string; weight: number }[];
  alternatives: { name: string }[];
  scores: { value: number }[];
}): FredProgress {
  const frameParts = [
    project.hero.trim().length > 0,
    project.treasure.trim().length > 0,
    project.dragon.trim().length > 0,
    project.quest.trim().length > 0,
    project.ruleClarity,
    project.ruleOwnership,
    project.ruleValue,
    project.ruleObstacle,
  ];
  const frame = Math.round((frameParts.filter(Boolean).length / frameParts.length) * 100);

  const whyFilled = project.whyNodes.filter((n) => n.content.trim()).length;
  const howFilled = project.howNodes.filter((n) => n.content.trim()).length;
  const exploreRaw = Math.min(whyFilled, 5) / 5 + Math.min(howFilled, 5) / 5;
  const explore = Math.round((exploreRaw / 2) * 100);

  const hasCriteria = project.criteria.length >= 2;
  const hasAlts = project.alternatives.length >= 2;
  const scored =
    project.scores.length > 0 &&
    project.scores.some((s) => s.value > 0);
  const decideParts = [hasCriteria, hasAlts, scored];
  const decide = Math.round((decideParts.filter(Boolean).length / decideParts.length) * 100);

  const overall = Math.round((frame + explore + decide) / 3);
  return { frame, explore, decide, overall };
}
