import { db } from "../src/db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

async function audit() {
  console.log("--- Starting DB Audit ---");
  const tables = [
    "time_entries",
    "time_breaks",
    "timesheets",
    "shifts",
    "time_policies",
    "employees",
    "users",
    "companies"
  ];

  for (const table of tables) {
    try {
      const result = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(table)}`);
      console.log(`✅ Table '${table}' exists. Count: ${result[0].count}`);
    } catch (e: any) {
      console.error(`❌ Table '${table}' check failed: ${e.message}`);
    }
  }

  try {
      const counts = await db.execute(sql`SELECT company_id, count(*) as count FROM employees GROUP BY company_id`);
      console.log("Employees per company:", counts);
  } catch (e: any) {
      console.error("❌ Employee count grouping failed:", e.message);
  }

  try {
    const guestUser = await db.execute(sql`SELECT * FROM users WHERE clerk_user_id = 'user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD'`);
    console.log("Guest User:", guestUser.length > 0 ? "Found" : "NOT FOUND");
    if (guestUser.length > 0) {
        const emp = await db.execute(sql`SELECT * FROM employees WHERE user_id = ${guestUser[0].id}`);
        console.log("Guest Employee Record:", emp.length > 0 ? "Found" : "NOT FOUND");
    }
  } catch (e: any) {
    console.error("❌ Guest user check failed:", e.message);
  }

  process.exit(0);
}

audit();
