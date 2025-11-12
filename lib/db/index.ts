import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neonConfig, Pool } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

// Detect if we're using Neon or local PostgreSQL
const isNeon = process.env.DATABASE_URL?.includes('neon.tech') ||
               process.env.USE_NEON === 'true';

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePostgres>;

if (isNeon) {
  // Use Neon serverless for cloud/production
  neonConfig.fetchConnectionCache = true;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema });
} else {
  // Use standard PostgreSQL for Docker/local development
  const connectionString = process.env.DATABASE_URL ||
    'postgresql://librarium:librarium_password@localhost:5432/librarium';

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzlePostgres(client, { schema });
}

export { db };
