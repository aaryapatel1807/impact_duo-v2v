import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloading.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use Neon serverless HTTP driver — designed for serverless/edge Next.js deployments.
// This avoids TCP connection pool issues that occur with the pg driver in API routes.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
