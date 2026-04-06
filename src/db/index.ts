import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ [Database Error] DATABASE_URL is not defined in .env.local");
}

// Disable prefetch as it is not supported for "transaction" pool mode
export const client = postgres(connectionString || "postgresql://notset@localhost:5432/circleworks", { 
  prepare: false,
  connect_timeout: 5, // Avoid long waits if DB is down
});

export const db = drizzle(client, { schema });
