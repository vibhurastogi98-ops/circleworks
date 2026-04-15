import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function createTableForce() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "agency_projects" (
        "id" serial PRIMARY KEY NOT NULL,
        "company_id" integer,
        "client_id" integer,
        "name" text NOT NULL,
        "description" text,
        "budget" integer,
        "start_date" date,
        "end_date" date,
        "status" text DEFAULT 'Active',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;
    console.log("Ensured agency_projects exists.");
  } catch (err) {
    console.error("Failed to ensure table:", err.message);
  }
  process.exit(0);
}

createTableForce().catch(console.error);
