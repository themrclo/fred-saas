"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="danger"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Excluir este projeto permanentemente?")) return;
        setBusy(true);
        await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        router.push("/dashboard");
        router.refresh();
      }}
    >
      Excluir
    </Button>
  );
}
