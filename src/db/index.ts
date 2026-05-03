import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  console.error("❌ [Database Error] DATABASE_URL is not defined");
}

// postgres-js does not support channel_binding — strip it if present (Neon adds it by default)
const connectionString = rawConnectionString
  ? rawConnectionString.replace(/[&?]channel_binding=require/g, '')
  : "postgresql://notset@localhost:5432/circleworks";

// Disable prefetch as it is not supported for "transaction" pool mode
export const client = postgres(connectionString, {
  prepare: false,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
