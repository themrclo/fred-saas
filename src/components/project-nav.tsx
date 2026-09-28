"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "", label: "Visão geral", suffix: "" },
  { href: "/frame", label: "Enquadrar", suffix: "/frame" },
  { href: "/why", label: "Mapa do Porquê", suffix: "/why" },
  { href: "/how", label: "Mapa do Como", suffix: "/how" },
  { href: "/decide", label: "Decidir", suffix: "/decide" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {links.map((l) => {
        const href = `${base}${l.suffix}`;
        const active =
          l.suffix === ""
            ? pathname === base
            : pathname.startsWith(href);
        return (
          <Link
            key={l.href}
            href={href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition",
              active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
