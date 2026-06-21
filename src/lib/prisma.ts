import { PrismaClient } from '@prisma/client';
import path from 'path';

// Fix for Netlify/Vercel serverless SQLite resolution
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath}`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
