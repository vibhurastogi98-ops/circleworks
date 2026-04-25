import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { count, gte } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function checkCounts() {
  try {
    const entriesCount = await db.select({ value: count() }).from(schema.timeEntries);
    console.log("Total Time Entries:", entriesCount[0].value);
    
    const now = new Date();
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0,0,0,0);

    console.log("Fetching week entries...");
    const start = Date.now();
    const weekEntries = await db.query.timeEntries.findMany({
      where: (te: any, { gte }: any) => gte(te.clockIn, weekStart),
      with: {
        breaks: true,
      }
    });
    const end = Date.now();
    console.log(`Fetched ${weekEntries.length} week entries in ${end - start}ms`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();
