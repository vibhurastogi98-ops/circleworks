import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function applyMigration() {
  const migrationPath = path.resolve(process.cwd(), 'drizzle/0001_legal_menace.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  
  const statements = migrationSql.split('--> statement-breakpoint');
  
  console.log(`Starting migration with ${statements.length} statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const rawStmt = statements[i].trim();
    if (!rawStmt) continue;
    
    // Remote comments/newlines for logging
    const logStmt = rawStmt.split('\n')[0].substring(0, 100);
    console.log(`[${i+1}/${statements.length}] Executing: ${logStmt}...`);
    
    try {
      await sql.unsafe(rawStmt);
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('already a column')) {
        console.log(`  (Skipping: ${err.message})`);
      } else {
        console.error(`  ❌ Error: ${err.message}`);
      }
    }
  }
  
  console.log("✅ Migration complete!");
  process.exit(0);
}

applyMigration().catch(err => {
  console.error("💥 Fatal Migration Error:", err);
  process.exit(1);
});
