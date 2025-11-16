import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

async function enablePgVector() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  console.log('🔄 Enabling pgvector extension...');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('✅ pgvector extension enabled successfully!');
  } catch (error) {
    console.error('❌ Failed to enable pgvector:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

enablePgVector();
