import { db } from "./src/db";
import { timeEntries, employees, users } from "./src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

async function checkOpenEntries() {
  const [userEmployee] = await db
    .select({ employeeId: employees.id })
    .from(users)
    .innerJoin(employees, eq(users.id, employees.userId))
    .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));

  const employeeId = userEmployee?.employeeId ?? 1;

  const openEntries = await db.query.timeEntries.findMany({
    where: and(
      eq(timeEntries.employeeId, employeeId),
      isNull(timeEntries.clockOut)
    ),
  });

  console.log(`Found ${openEntries.length} open entries for employee ${employeeId}`);
  console.log(JSON.stringify(openEntries, null, 2));
  process.exit(0);
}

checkOpenEntries();
