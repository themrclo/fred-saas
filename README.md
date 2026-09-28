# FrED — SaaS educacional (Unimontes)

Ferramenta web para estruturar **problemas complexos** com o ciclo **FrED**:
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
| Banco | Prisma 5 + **SQLite** (dev) / Postgres compatível via `DATABASE_URL` |
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
    utils.ts                # progresso do ciclo FrED
prisma/
  schema.prisma
  seed.ts                   # usuários demo + caso tutorial
```

### Modelo de dados (resumo)

- `User` → `Project` (1:N)
- `Project` guarda o enquadramento e o estágio do ciclo
- `WhyNode` / `HowNode` — árvores (parentId)
- `Criterion` + `Alternative` + `Score` — matriz de decisão

### Fluxo FrED na UI

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

## Deploy (Vercel)

1. Repositório no GitHub conectado ao Vercel
2. Variáveis de ambiente:
   - `AUTH_SECRET` (ex.: `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `DATABASE_URL` — em serverless, prefira **Postgres (Neon)**; SQLite local não persiste no filesystem efêmero da Vercel
3. Build Command: `prisma generate && next build`
4. Após o primeiro deploy com Postgres: rode seed via `npx prisma db seed` com a URL de produção, ou use as contas criadas por signup

### Nota sobre SQLite vs Postgres

- **Local / revisão rápida:** SQLite (`file:./dev.db`) — zero setup.
- **Vercel produção:** troque o `provider` no `schema.prisma` para `postgresql` e use uma URL Neon/Vercel Postgres, **ou** mantenha SQLite apenas para demo local e documente isso ao professor.

Este repositório inicia em SQLite para velocidade de desenvolvimento e inspeção.

## O que está pronto (MVP)

- [x] Signup / login (credentials)
- [x] CRUD de projetos
- [x] Estúdio de Enquadramento + 4 regras
- [x] Mapa do Porquê e Mapa do Como (lista aninhada)
- [x] Critérios com pesos + matriz + ranking
- [x] Painel de status do ciclo FrED
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
