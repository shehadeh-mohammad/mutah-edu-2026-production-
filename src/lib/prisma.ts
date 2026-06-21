import { PrismaClient } from '@prisma/client';
import path from 'path';

// Resolve db path relative to the project root — works on Render's ephemeral
// free-tier container (no paid disk needed) and in local development alike.
// The pre-seeded dev.db is committed to Git and deployed with the container,
// so the 130 chapters are always available fresh on every boot.
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = process.env.DATABASE_URL ?? `file:${dbPath}`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

// Persist the singleton across hot-reloads in development only
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
