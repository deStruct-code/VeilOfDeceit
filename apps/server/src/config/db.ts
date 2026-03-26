import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  // Railway Postgres требует SSL в prod
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

db.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err.message);
});

export async function runMigration() {
  const fs = await import('fs');
  const path = await import('path');
  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await db.query(sql);
  console.log('[db] Migration applied');
}
