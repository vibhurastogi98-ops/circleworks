import { db } from "./src/db";
import { employees } from "./src/db/schema";

async function checkEmployees() {
  const all = await db.query.employees.findMany();
  console.log("Employees in DB:", JSON.stringify(all.map(e => ({ id: e.id, name: e.firstName })), null, 2));
  process.exit(0);
}

checkEmployees();
