"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FrameData = {
  hero: string;
  treasure: string;
  dragon: string;
  quest: string;
  ruleClarity: boolean;
  ruleOwnership: boolean;
  ruleValue: boolean;
  ruleObstacle: boolean;
};

const RULES = [
  {
    key: "ruleClarity" as const,
    title: "Clareza do desafio",
    help: "O problema está formulado de modo específico o bastante para orientar a exploração?",
  },
  {
    key: "ruleOwnership" as const,
    title: "Protagonismo definido",
    help: "Fica claro quem é o herói — a pessoa ou grupo que age sobre o problema?",
  },
  {
    key: "ruleValue" as const,
    title: "Valor desejado explícito",
    help: "O tesouro (resultado desejado) está descrito de forma verificável?",
  },
  {
    key: "ruleObstacle" as const,
    title: "Obstáculo concreto",
    help: "O dragão (obstáculo principal) é real e observável, não apenas uma preferência vaga?",
  },
];

export function FrameStudio({
  projectId,
  initial,
}: {
  projectId: string;
  initial: FrameData;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(next: FrameData = data) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/frame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setMsg("Salvo.");
      router.refresh();
    } catch {
      setMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof FrameData>(key: K, value: FrameData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Herói</CardTitle>
            <CardDescription>Quem enfrenta o desafio? (pessoa, equipe ou comunidade)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.hero}
              onChange={(e) => update("hero", e.target.value)}
              placeholder="Ex.: Equipe de extensão do curso de Administração"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tesouro</CardTitle>
            <CardDescription>Qual resultado desejado vale a pena conquistar?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.treasure}
              onChange={(e) => update("treasure", e.target.value)}
              placeholder="Ex.: Um plano de ação aprovado pela coordenação em 30 dias"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dragão</CardTitle>
            <CardDescription>Qual é o obstáculo principal que impede o tesouro?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.dragon}
              onChange={(e) => update("dragon", e.target.value)}
              placeholder="Ex.: Orçamento insuficiente e calendário acadêmico apertado"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Missão</CardTitle>
            <CardDescription>Em uma frase: o que precisa ser resolvido?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.quest}
              onChange={(e) => update("quest", e.target.value)}
              placeholder="Ex.: Definir como reduzir filas no restaurante universitário sem aumentar custos"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist das 4 regras</CardTitle>
          <CardDescription>
            Use estas regras originais em português para validar se o enquadramento está pronto para explorar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {RULES.map((r) => (
            <label
              key={r.key}
              className="flex gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-indigo-600"
                checked={data[r.key]}
                onChange={(e) => update(r.key, e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{r.title}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{r.help}</span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={() => save()} disabled={saving}>
          {saving ? "Salvando…" : "Salvar enquadramento"}
        </Button>
        <Button
          variant="secondary"
          disabled={saving}
          onClick={async () => {
            await save();
            await fetch(`/api/projects/${projectId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stage: "explore" }),
            });
            router.push(`/projects/${projectId}/why`);
            router.refresh();
          }}
        >
          Avançar para Explorar
        </Button>
        {msg && <span className="text-sm text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}
