import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

/**
 * Em serverless (Vercel), o filesystem do bundle é read-only.
 * Copiamos o SQLite pré-seedado para /tmp na primeira execução da instância.
 * Ideal para demo acadêmica; em produção real use Postgres (Neon).
 */
function ensureServerlessDb() {
  if (!process.env.VERCEL) return;
  const target = "/tmp/fred.db";
  const candidates = [
    path.join(process.cwd(), "prisma", "seed.db"),
    path.join(process.cwd(), "prisma", "dev.db"),
  ];
  if (fs.existsSync(target)) return;
  for (const src of candidates) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, target);
      return;
    }
  }
}

ensureServerlessDb();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
