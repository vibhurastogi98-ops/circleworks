import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function checkTables() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log("Tables in 'public' schema:");
  tables.forEach(t => console.log(` - ${t.table_name}`));
  process.exit(0);
}

checkTables().catch(console.error);
