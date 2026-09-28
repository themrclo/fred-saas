"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export type TreeNode = {
  id: string;
  parentId: string | null;
  content: string;
  sortOrder: number;
};

export function TreeEditor({
  projectId,
  kind,
  nodes: initial,
  rootPrompt,
}: {
  projectId: string;
  kind: "why" | "how";
  nodes: TreeNode[];
  rootPrompt: string;
}) {
  const router = useRouter();
  const [nodes, setNodes] = useState(initial);
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/projects/${projectId}/${kind}`;

  async function add(parentId: string | null) {
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", parentId }),
      });
      if (!res.ok) throw new Error();
      const node = await res.json();
      setNodes((n) => [...n, node]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function update(nodeId: string, content: string) {
    setNodes((list) => list.map((n) => (n.id === nodeId ? { ...n, content } : n)));
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, content }),
    });
  }

  async function remove(nodeId: string) {
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}?nodeId=${nodeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      // remove node and descendants locally
      const toRemove = new Set<string>();
      const walk = (id: string) => {
        toRemove.add(id);
        nodes.filter((n) => n.parentId === id).forEach((c) => walk(c.id));
      };
      walk(nodeId);
      setNodes((list) => list.filter((n) => !toRemove.has(n.id)));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function render(parentId: string | null, depth = 0): React.ReactNode {
    const kids = nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <ul className={depth === 0 ? "space-y-3" : "mt-2 ml-4 space-y-2 border-l border-slate-200 pl-3"}>
        {kids.map((n) => (
          <li key={n.id}>
            <div className="flex gap-2 items-start">
              <Input
                value={n.content}
                onChange={(e) => update(n.id, e.target.value)}
                placeholder={depth === 0 ? rootPrompt : "Desdobre em um subnó…"}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => add(n.id)}
                title="Adicionar filho"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => remove(n.id)}
                title="Remover"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
            {render(n.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      {nodes.length === 0 ? (
        <p className="text-sm text-slate-500">
          Ainda não há nós. Comece com a pergunta-raiz.
        </p>
      ) : (
        render(null)
      )}
      <Button disabled={busy} onClick={() => add(null)} variant="secondary">
        <Plus className="h-4 w-4" />
        Adicionar nó raiz
      </Button>
    </div>
  );
}
