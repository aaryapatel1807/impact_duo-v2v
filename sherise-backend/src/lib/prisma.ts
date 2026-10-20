import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Reuse one client/pool across warm serverless invocations and dev
// hot-reloads instead of opening a fresh pool on every module load.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

export const pool = globalForPrisma.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // per-instance cap — serverless instances multiply, Neon pools upstream
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}
