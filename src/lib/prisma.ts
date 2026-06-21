import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// On Render (persistent disk), DATABASE_URL is set to file:/data/dev.db
// Locally, fall back to prisma/dev.db relative to project root
function resolveDbUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${dbPath}`;
}

const dbUrl = resolveDbUrl();

// On Render the disk is at /data — copy the bundled dev.db there on first boot
// so that all the pre-seeded data is available without running a separate seed step.
function bootstrapDb() {
  if (!process.env.DATABASE_URL) return; // local dev — skip

  const targetPath = '/data/dev.db';
  const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(targetPath)) {
    try {
      fs.mkdirSync('/data', { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
      console.log('[Prisma] Bootstrapped pre-seeded dev.db → /data/dev.db');
    } catch (err) {
      console.error('[Prisma] Failed to bootstrap dev.db:', err);
    }
  }
}

bootstrapDb();

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

// Cache the client in all environments on a persistent server (Render)
// Only skip caching in local development hot-reload scenarios
if (process.env.NODE_ENV !== 'development') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
