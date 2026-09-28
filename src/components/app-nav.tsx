import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";

export async function AppNav() {
  const session = await auth();
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">Fr</span>
          <span>FrED</span>
          <span className="hidden sm:inline text-xs font-normal text-slate-400 ml-1">Unimontes</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                Projetos
              </Link>
              <Link href="/tutorial" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                Tutorial
              </Link>
              <span className="hidden sm:inline text-slate-400 px-2">{session.user?.name || session.user?.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Criar conta</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
