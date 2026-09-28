"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

type Criterion = { id: string; name: string; weight: number };
type Alternative = { id: string; name: string };
type Score = { criterionId: string; alternativeId: string; value: number };

export function DecisionMatrix({
  projectId,
  criteria: initialCriteria,
  alternatives: initialAlts,
  scores: initialScores,
}: {
  projectId: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  scores: Score[];
}) {
  const router = useRouter();
  const [criteria, setCriteria] = useState(initialCriteria);
  const [alts, setAlts] = useState(initialAlts);
  const [scores, setScores] = useState(initialScores);
  const [newCrit, setNewCrit] = useState("");
  const [newWeight, setNewWeight] = useState("1");
  const [newAlt, setNewAlt] = useState("");
  const [busy, setBusy] = useState(false);

  const ranking = useMemo(() => {
    return alts
      .map((alt) => {
        let total = 0;
        let weightSum = 0;
        for (const c of criteria) {
          const s = scores.find(
            (x) => x.criterionId === c.id && x.alternativeId === alt.id
          );
          const v = s?.value ?? 0;
          total += v * c.weight;
          weightSum += c.weight;
        }
        const weighted = weightSum > 0 ? total / weightSum : 0;
        return { id: alt.id, name: alt.name, weighted, total };
      })
      .sort((a, b) => b.weighted - a.weighted);
  }, [alts, criteria, scores]);

  async function addCriterion() {
    if (!newCrit.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/criteria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCrit.trim(), weight: Number(newWeight) || 1 }),
      });
      if (!res.ok) throw new Error();
      const c = await res.json();
      setCriteria((list) => [...list, c]);
      setScores((list) => [
        ...list,
        ...alts.map((a) => ({ criterionId: c.id, alternativeId: a.id, value: 0 })),
      ]);
      setNewCrit("");
      setNewWeight("1");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addAlternative() {
    if (!newAlt.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/alternatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAlt.trim() }),
      });
      if (!res.ok) throw new Error();
      const a = await res.json();
      setAlts((list) => [...list, a]);
      setScores((list) => [
        ...list,
        ...criteria.map((c) => ({ criterionId: c.id, alternativeId: a.id, value: 0 })),
      ]);
      setNewAlt("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setScore(criterionId: string, alternativeId: string, value: number) {
    setScores((list) => {
      const exists = list.find(
        (s) => s.criterionId === criterionId && s.alternativeId === alternativeId
      );
      if (exists) {
        return list.map((s) =>
          s.criterionId === criterionId && s.alternativeId === alternativeId
            ? { ...s, value }
            : s
        );
      }
      return [...list, { criterionId, alternativeId, value }];
    });
    await fetch(`/api/projects/${projectId}/scores`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criterionId, alternativeId, value }),
    });
  }

  async function updateWeight(criterionId: string, weight: number) {
    setCriteria((list) =>
      list.map((c) => (c.id === criterionId ? { ...c, weight } : c))
    );
    await fetch(`/api/projects/${projectId}/criteria`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criterionId, weight }),
    });
  }

  async function removeCriterion(criterionId: string) {
    setBusy(true);
    try {
      await fetch(`/api/projects/${projectId}/criteria?criterionId=${criterionId}`, {
        method: "DELETE",
      });
      setCriteria((list) => list.filter((c) => c.id !== criterionId));
      setScores((list) => list.filter((s) => s.criterionId !== criterionId));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeAlt(alternativeId: string) {
    setBusy(true);
    try {
      await fetch(
        `/api/projects/${projectId}/alternatives?alternativeId=${alternativeId}`,
        { method: "DELETE" }
      );
      setAlts((list) => list.filter((a) => a.id !== alternativeId));
      setScores((list) => list.filter((s) => s.alternativeId !== alternativeId));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function scoreOf(cId: string, aId: string) {
    return scores.find((s) => s.criterionId === cId && s.alternativeId === aId)?.value ?? 0;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Critérios</CardTitle>
            <CardDescription>Defina o que importa e o peso relativo (0,1–10).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="flex gap-2 items-center">
                <span className="flex-1 text-sm text-slate-800">{c.name}</span>
                <Input
                  type="number"
                  min={0.1}
                  max={10}
                  step={0.5}
                  className="w-20"
                  value={c.weight}
                  onChange={(e) => updateWeight(c.id, Number(e.target.value) || 1)}
                />
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => removeCriterion(c.id)}>
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Novo critério"
                value={newCrit}
                onChange={(e) => setNewCrit(e.target.value)}
              />
              <Input
                type="number"
                className="w-20"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                title="Peso"
              />
              <Button disabled={busy} onClick={addCriterion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternativas</CardTitle>
            <CardDescription>Opções candidatas à decisão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alts.map((a) => (
              <div key={a.id} className="flex gap-2 items-center">
                <span className="flex-1 text-sm text-slate-800">{a.name}</span>
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => removeAlt(a.id)}>
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Nova alternativa"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
              />
              <Button disabled={busy} onClick={addAlternative}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de decisão</CardTitle>
          <CardDescription>Pontue cada alternativa de 0 a 5 em cada critério.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {criteria.length === 0 || alts.length === 0 ? (
            <p className="text-sm text-slate-500">
              Adicione pelo menos 2 critérios e 2 alternativas para montar a matriz.
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-3 font-medium text-slate-500">Critério (peso)</th>
                  {alts.map((a) => (
                    <th key={a.id} className="text-left py-2 px-2 font-medium text-slate-700">
                      {a.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 text-slate-700">
                      {c.name} <span className="text-slate-400">×{c.weight}</span>
                    </td>
                    {alts.map((a) => (
                      <td key={a.id} className="py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          step={1}
                          className="w-16"
                          value={scoreOf(c.id, a.id)}
                          onChange={(e) =>
                            setScore(c.id, a.id, Math.min(5, Math.max(0, Number(e.target.value) || 0)))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranking</CardTitle>
          <CardDescription>Média ponderada (maior = melhor, no momento).</CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-sm text-slate-500">Sem alternativas ainda.</p>
          ) : (
            <ol className="space-y-2">
              {ranking.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-900">
                    <span className="text-indigo-600 mr-2">#{i + 1}</span>
                    {r.name}
                  </span>
                  <span className="text-sm text-slate-600">{r.weighted.toFixed(2)}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
