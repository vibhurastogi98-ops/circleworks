import { db } from "./src/db";
import { timeEntries } from "./src/db/schema";
import { desc } from "drizzle-orm";

async function checkEntries() {
  const entries = await db.query.timeEntries.findMany({
    orderBy: [desc(timeEntries.id)],
    limit: 5,
  });
  console.log(JSON.stringify(entries, null, 2));
  process.exit(0);
}

checkEntries();
