import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your environment variables.');
}

// Prisma Client with connection pooling for production
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});
