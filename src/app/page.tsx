import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="text-center space-y-6">
        <p className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1">
          Disciplina de graduação · Unimontes
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          FrED — Enquadrar, Explorar, Decidir
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          SaaS educacional para estruturar problemas complexos com o ciclo FrED.
          Conteúdo e interface 100% originais em português brasileiro — sem texto
          de livros comerciais.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">Começar agora</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Entrar (demo)
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "Enquadrar",
            d: "Herói, tesouro, dragão e missão + checklist das 4 regras.",
          },
          {
            t: "Explorar",
            d: "Mapa do Porquê e Mapa do Como em árvore editável.",
          },
          {
            t: "Decidir",
            d: "Critérios com pesos, matriz de pontuação e ranking.",
          },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{c.t}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-sm text-slate-700">
        <p className="font-medium text-indigo-900">Contas de demonstração</p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          <li>aluno@unimontes.br · demo1234</li>
          <li>professor@unimontes.br · demo1234</li>
        </ul>
      </section>
    </div>
  );
}
