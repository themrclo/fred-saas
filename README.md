# FrEDzinho — SaaS educacional (Unimontes)

Ferramenta web para estruturar **problemas complexos** com o ciclo **FrEDzinho** (FrED):
**Enquadrar → Explorar → Decidir**.

> Conteúdo e interface **100% originais em português brasileiro**.
> Não contém texto do livro *Solvable*, nem branding/UI de produtos comerciais (ex.: Dragon Master), nem material Pearson.

## Objetivo pedagógico

Apoiar alunos de graduação a:

1. **Enquadrar** um desafio (Herói, Tesouro, Dragão, Missão + checklist das 4 regras)
2. **Explorar** causas e caminhos (Mapa do Porquê, Mapa do Como)
3. **Decidir** com critérios ponderados e matriz de pontuação
4. **Exportar** um cartão Markdown para revisão do professor

Os conceitos metodológicos (HTDQ / mapas / critérios / matriz) são usados apenas como *método*;
todos os rótulos, textos de ajuda e o caso tutorial são originais.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS 4 + componentes leves |
| Banco | Prisma 5 + **PostgreSQL (Neon)** |
| Auth | Auth.js (next-auth v5) — e-mail/senha (Credentials) |
| Deploy | Vercel + GitHub |

## Arquitetura (para revisão de código)

```
src/
  app/
    (auth)/login|signup     # páginas públicas de autenticação
    (app)/dashboard         # lista de projetos
    (app)/projects/[id]/…  # frame | why | how | decide
    (app)/tutorial          # caso guiado original
    api/…                   # rotas REST (CRUD + export)
  components/               # UI + FrameStudio + TreeEditor + DecisionMatrix
  lib/
    auth.ts                 # Auth.js
    prisma.ts               # cliente Prisma
    export-markdown.ts      # gerador do cartão .md
    utils.ts                # progresso do ciclo FrEDzinho
prisma/
  schema.prisma
  seed.ts                   # usuários demo + caso tutorial
```

### Modelo de dados (resumo)

- `User` → `Project` (1:N)
- `Project` guarda o enquadramento e o estágio do ciclo
- `WhyNode` / `HowNode` — árvores (parentId)
- `Criterion` + `Alternative` + `Score` — matriz de decisão

### Fluxo FrEDzinho na UI

Painel lateral calcula progresso:

- **Enquadrar**: preenchimento dos 4 campos + 4 regras
- **Explorar**: nós preenchidos nos mapas
- **Decidir**: ≥2 critérios, ≥2 alternativas e pontuações

## Contas demo (após `npm run db:seed`)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `aluno@unimontes.br` | `demo1234` | Aluno (com tutorial) |
| `professor@unimontes.br` | `demo1234` | Professor |

## Como rodar localmente

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run db:push` — aplica schema Prisma
- `npm run db:seed` — popula usuários e tutorial
- `npm run db:studio` — Prisma Studio

## Caso tutorial (ficção original)

**Equipe Athena — Feira de Ciências**: Lia, Bruno e Marina precisam escolher o formato
de apresentação (pôster, maquete ou vídeo+estande) sob prazo de 10 dias e R$ 200.
O projeto é marcado com `isTutorial: true` e pode ser aberto em `/tutorial`.

## URLs

| Ambiente | URL |
|----------|-----|
| **Produção (Vercel)** | https://fred-saas.vercel.app |
| **Código (GitHub)** | https://github.com/themrclo/fred-saas |
| Local | http://localhost:3000 |

## Deploy (Vercel)

Projeto Vercel: `fred-saas` (já publicado).

Variáveis de ambiente (Vercel + local):

- `DATABASE_URL` — Neon Postgres (obrigatória)
- `AUTH_SECRET` / `NEXTAUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXTAUTH_URL` — URL pública em produção (ex.: `https://fred-saas.vercel.app`)

### Banco PostgreSQL (Neon)

O app usa **Neon Postgres** (`provider = "postgresql"` no Prisma).

- Variável obrigatória: `DATABASE_URL` (connection string com SSL)
- Local: copie `.env.example` → `.env`, rode `npm run db:push` e `npm run db:seed`
- Se o banco foi criado via Claimable Neon (`neon.new`), **reivindique** em até ~72h com a `claim_url` para não expirar

Brand: interface e documentação usam o nome **FrEDzinho** (método FrED).

## O que está pronto (MVP)

- [x] Signup / login (credentials)
- [x] CRUD de projetos
- [x] Estúdio de Enquadramento + 4 regras
- [x] Mapa do Porquê e Mapa do Como (lista aninhada)
- [x] Critérios com pesos + matriz + ranking
- [x] Painel de status do ciclo FrEDzinho
- [x] Export Markdown
- [x] Tutorial guiado original
- [x] README em PT

## O que NÃO está no escopo deste MVP

- Magic link / OAuth social
- React Flow (optamos por árvore simples e revisável)
- Colaboração em tempo real / multiplayer
- IA generativa

## Licença e autoria

Projeto acadêmico de Marcelo Caetano Melo (Unimontes).
Código e textos de interface: originais para fins educacionais.
