import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, employees, companies } from "@/db/schema";
import { normalizeOptionalAccountType, type AccountType } from "@/lib/account-types";
import { eq, or } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

export const SESSION_COOKIE = "cw_session";
const sessionInvalidatedAtByUser = new Map<number, number>();

export interface SessionUser {
  userId: number;
  email: string;
  role: string;
  accountType: AccountType | null;
}

type SessionUserInput = Omit<SessionUser, "accountType"> & {
  accountType?: string | null;
};

function toSessionUser(user: SessionUserInput): SessionUser {
  return {
    userId: user.userId,
    email: user.email,
    role: user.role || "employee",
    accountType: normalizeOptionalAccountType(user.accountType),
  };
}

export async function resolveSessionUserByUserId(userId: number): Promise<SessionUser | null> {
  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      role: users.role,
      accountType: companies.accountType,
    })
    .from(users)
    .leftJoin(employees, eq(employees.userId, users.id))
    .leftJoin(companies, eq(employees.companyId, companies.id))
    .where(eq(users.id, userId))
    .limit(1);

  return row
    ? toSessionUser({
        userId: row.userId,
        email: row.email,
        role: row.role ?? "employee",
        accountType: row.accountType,
      })
    : null;
}

async function resolveSessionUserFromSupabaseIdentity(identity: {
  clerkUserId?: string | null;
  email: string;
}): Promise<SessionUser | null> {
  const normalizedEmail = identity.email.toLowerCase().trim();
  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      role: users.role,
      accountType: companies.accountType,
    })
    .from(users)
    .leftJoin(employees, eq(employees.userId, users.id))
    .leftJoin(companies, eq(employees.companyId, companies.id))
    .where(
      or(
        eq(users.clerkUserId, identity.clerkUserId ?? ""),
        eq(users.email, normalizedEmail)
      )
    )
    .limit(1);

  return row
    ? toSessionUser({
        userId: row.userId,
        email: row.email,
        role: row.role ?? "employee",
        accountType: row.accountType,
      })
    : null;
}

export async function createSessionToken(user: SessionUserInput, rememberMe = false): Promise<string> {
  const sessionUser = toSessionUser(user);
  return new SignJWT({
    userId: sessionUser.userId,
    email: sessionUser.email,
    role: sessionUser.role,
    accountType: sessionUser.accountType,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "30d" : "24h")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as number;
    const tokenIssuedAt = typeof payload.iat === "number" ? payload.iat : 0;
    const invalidatedAt = sessionInvalidatedAtByUser.get(userId);

    if (invalidatedAt && tokenIssuedAt < invalidatedAt) {
      return null;
    }

    return {
      userId,
      email: payload.email as string,
      role: payload.role as string,
      accountType:
        normalizeOptionalAccountType(payload.accountType) ??
        (await resolveSessionUserByUserId(userId))?.accountType ??
        null,
    };
  } catch {
    return null;
  }
}

export function invalidateUserSessions(userId: number) {
  sessionInvalidatedAtByUser.set(userId, Math.floor(Date.now() / 1000));
}

async function resolveSessionFromSupabase(req?: NextRequest): Promise<SessionUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = req ? null : await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req ? req.cookies.getAll() : cookieStore?.getAll() ?? [];
      },
      setAll() {
        // No cookie writes needed for read-only session resolution.
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  return resolveSessionUserFromSupabaseIdentity({
    clerkUserId: user.id,
    email: user.email,
  });
}

export interface UserContext {
  companyId: number;
  employeeId: number;
}

export async function resolveUserContext(session: SessionUser): Promise<UserContext | null> {
  const [row] = await db
    .select({ companyId: employees.companyId, employeeId: employees.id })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .where(eq(users.id, session.userId));
  if (!row?.companyId) return null;
  return { companyId: row.companyId, employeeId: row.employeeId };
}

export async function getSession(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  } else {
    token = (await cookies()).get(SESSION_COOKIE)?.value;
  }

  if (token) {
    const jwtSession = await verifySessionToken(token);
    if (jwtSession) return jwtSession;
  }

  // Fallback for flows where only Supabase cookies are present.
  return resolveSessionFromSupabase(req);
}

export async function getAccountType(req?: NextRequest): Promise<AccountType | null> {
  const session = await getSession(req);
  return session?.accountType ?? null;
}
