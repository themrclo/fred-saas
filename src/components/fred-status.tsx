import { cn, fredStageLabel, type FredProgress } from "@/lib/utils";

const stages = [
  { key: "frame" as const, label: "Enquadrar", hint: "Herói, tesouro, dragão, missão" },
  { key: "explore" as const, label: "Explorar", hint: "Mapas do porquê e do como" },
  { key: "decide" as const, label: "Decidir", hint: "Critérios e matriz" },
];

export function FredStatusPanel({
  stage,
  progress,
  className,
}: {
  stage: string;
  progress: FredProgress;
  className?: string;
}) {
  return (
    <aside className={cn("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Ciclo FrED</h2>
        <span className="text-xs font-medium text-indigo-600">{progress.overall}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${progress.overall}%` }}
        />
      </div>
      <ol className="space-y-3">
        {stages.map((s) => {
          const pct = progress[s.key];
          const active = stage === s.key;
          return (
            <li key={s.key} className={cn("rounded-xl p-3 border", active ? "border-indigo-200 bg-indigo-50" : "border-slate-100")}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-medium", active ? "text-indigo-800" : "text-slate-800")}>
                  {s.label}
                </span>
                <span className="text-xs text-slate-500">{pct}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{s.hint}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/80 overflow-hidden border border-slate-100">
                <div className="h-full bg-indigo-400" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-slate-500">
        Estágio atual: <strong className="text-slate-700">{fredStageLabel(stage)}</strong>
      </p>
    </aside>
  );
}
