import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function testQuery() {
  try {
    const result = await sql`SELECT * FROM "agency_projects" LIMIT 1`;
    console.log("Query successful, found", result.length, "rows");
  } catch (err) {
    console.error("Query failed:", err.message);
  }
  process.exit(0);
}

testQuery().catch(console.error);
