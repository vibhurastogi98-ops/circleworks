import { NextResponse } from "next/server";
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { employeeBankAccounts, employees, users } from "@/db/schema";
import { getSession } from "@/lib/session";

const plaidEnvironment = process.env.PLAID_ENV || "sandbox";
const configuration = new Configuration({
  basePath:
    PlaidEnvironments[plaidEnvironment as keyof typeof PlaidEnvironments] ||
    PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
      "PLAID-SECRET": process.env.PLAID_SECRET || "",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const hasPlaidCredentials = Boolean(
  process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET,
);

async function ensureBankAccountColumns() {
  await db.execute(sql`
    ALTER TABLE employee_bank_accounts
      ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'checking',
      ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS bank_logo_url text,
      ADD COLUMN IF NOT EXISTS plaid_account_id text,
      ADD COLUMN IF NOT EXISTS plaid_processor_token text,
      ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()
  `);
}

async function getCurrentEmployee() {
  const session = await getSession();
  if (!session) return null;

  const [employee] = await db
    .select({
      id: employees.id,
      userId: users.id,
      email: users.email,
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .where(eq(users.id, session.userId));

  return employee || null;
}

function normalizeMask(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits
    ? digits.slice(-4).padStart(Math.min(digits.length, 4), "0")
    : "0000";
}

function normalizeVerificationStatus(value: unknown) {
  const status = String(value || "").toLowerCase();
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}

function logoDataUri(logo?: string | null) {
  return logo ? `data:image/png;base64,${logo}` : null;
}

function normalizeLogoUrl(logo?: string | null) {
  if (!logo) return null;
  if (logo.startsWith("data:") || logo.startsWith("http")) return logo;
  return logoDataUri(logo);
}

function getSelectedPlaidAccount(metadata: any, accountId?: string | null) {
  const accounts = Array.isArray(metadata?.accounts) ? metadata.accounts : [];
  return (
    metadata?.account ||
    accounts.find((account: any) => account.id === accountId) ||
    accounts[0] ||
    {}
  );
}

function publicBankAccount(
  row: typeof employeeBankAccounts.$inferSelect | null,
) {
  if (!row) return null;

  return {
    id: row.id,
    bankName: row.bankName,
    bankLogoUrl: row.bankLogoUrl,
    mask: normalizeMask(row.accountNumberMasked),
    accountNumber: row.accountNumberMasked,
    accountType: row.accountType || "checking",
    verificationStatus: normalizeVerificationStatus(row.verificationStatus),
    verified: normalizeVerificationStatus(row.verificationStatus) === "Verified",
    lastUpdated: (row.updatedAt || row.createdAt || new Date())
      .toISOString()
      .split("T")[0],
  };
}

export async function GET() {
  try {
    await ensureBankAccountColumns();

    const employee = await getCurrentEmployee();
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bankAccount, linkTokenResponse] = await Promise.all([
      db.query.employeeBankAccounts.findFirst({
        where: and(
          eq(employeeBankAccounts.employeeId, employee.id),
          eq(employeeBankAccounts.isPrimary, true),
        ),
        orderBy: [
          desc(employeeBankAccounts.updatedAt),
          desc(employeeBankAccounts.createdAt),
        ],
      }),
      hasPlaidCredentials
        ? plaidClient.linkTokenCreate({
            user: { client_user_id: String(employee.id) },
            client_name: "CircleWorks",
            products: [Products.Auth],
            country_codes: [CountryCode.Us],
            language: "en",
            auth: {
              instant_match_enabled: true,
              instant_microdeposits_enabled: false,
              same_day_microdeposits_enabled: false,
              automated_microdeposits_enabled: false,
            },
            account_filters: {
              depository: {
                account_subtypes: ["checking"] as any,
              },
            },
          })
        : Promise.resolve({
            data: { link_token: `mock_link_${employee.id}_${Date.now()}` },
          } as any),
    ]);

    return NextResponse.json({
      link_token: linkTokenResponse.data.link_token,
      is_mock: !hasPlaidCredentials,
      bankAccount: publicBankAccount(bankAccount || null),
    });
  } catch (error: any) {
    console.error("[Employee Bank Account GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load bank account setup" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureBankAccountColumns();

    const employee = await getCurrentEmployee();
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const isManual = body.method === "manual" || body.manual === true;

    let bankName = "Verified Bank";
    let bankLogoUrl: string | null = null;
    let accountType = "checking";
    let routingNumber = "verified-by-plaid";
    let accountNumberMasked = "0000";
    let verificationStatus = "Verified";
    let plaidAccountId: string | null = body.account_id || null;
    let plaidProcessorToken: string | null = null;

    if (isManual) {
      bankName = String(body.bankName || "Manual bank account").trim();
      routingNumber = String(body.routingNumber || "").trim();
      accountType = String(body.accountType || "checking").toLowerCase();
      const accountDigits = String(
        body.accountNumber || body.accountNumberMasked || "",
      ).replace(/\D/g, "");
      accountNumberMasked = normalizeMask(
        body.accountNumber || body.accountNumberMasked,
      );
      verificationStatus = "Pending";

      if (!bankName || !routingNumber || !accountDigits) {
        return NextResponse.json(
          {
            error: "Bank name, routing number, and account number are required",
          },
          { status: 400 },
        );
      }
    } else {
      const publicToken = body.public_token || body.publicToken || body.processor_token;
      const suppliedProcessorToken =
        !body.public_token && !body.publicToken && body.processor_token
          ? String(body.processor_token)
          : null;
      const metadata = body.metadata || {};
      const selectedAccount = getSelectedPlaidAccount(metadata, plaidAccountId);
      const institutionId = metadata?.institution?.institution_id;

      plaidAccountId =
        plaidAccountId ||
        selectedAccount.id ||
        selectedAccount.account_id ||
        null;
      bankName =
        metadata?.institution?.name || selectedAccount.name || "Verified Bank";
      bankLogoUrl = normalizeLogoUrl(
        metadata?.institution?.logo || metadata?.institution?.logo_url,
      );
      accountType =
        selectedAccount.subtype || selectedAccount.type || "checking";
      accountNumberMasked = normalizeMask(
        selectedAccount.mask || body.mask || plaidAccountId,
      );

      if (!plaidAccountId) {
        return NextResponse.json(
          { error: "A checking account must be selected" },
          { status: 400 },
        );
      }

      if (String(accountType).toLowerCase() !== "checking") {
        return NextResponse.json(
          { error: "Only checking accounts can be used for direct deposit" },
          { status: 400 },
        );
      }

      if (hasPlaidCredentials && publicToken) {
        const exchange = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken,
        });
        const accessToken = exchange.data.access_token;

        const [processorResponse, authResponse] = await Promise.all([
          plaidClient.processorTokenCreate({
            access_token: accessToken,
            account_id: plaidAccountId,
            processor: ProcessorTokenCreateRequestProcessorEnum.Dwolla,
          }),
          plaidClient.authGet({ access_token: accessToken }),
        ]);

        plaidProcessorToken = processorResponse.data.processor_token;

        const plaidAccount = authResponse.data.accounts.find(
          (account) => account.account_id === plaidAccountId,
        );
        const achNumbers = authResponse.data.numbers.ach.find(
          (account) => account.account_id === plaidAccountId,
        );

        if (!plaidAccount || !achNumbers) {
          return NextResponse.json(
            {
              error:
                "Selected account could not be verified for direct deposit",
            },
            { status: 400 },
          );
        }

        bankName = metadata?.institution?.name || plaidAccount.name || bankName;
        accountType = plaidAccount.subtype || accountType;
        accountNumberMasked = normalizeMask(
          plaidAccount.mask || achNumbers.account,
        );
        routingNumber = achNumbers.routing;

        if (institutionId) {
          try {
            const institution = await plaidClient.institutionsGetById({
              institution_id: institutionId,
              country_codes: [CountryCode.Us],
              options: { include_optional_metadata: true },
            });
            bankLogoUrl = normalizeLogoUrl(institution.data.institution.logo);
          } catch (logoError) {
            console.warn("[Plaid Bank Logo Warning]", logoError);
          }
        }
      } else if (hasPlaidCredentials && !publicToken) {
        return NextResponse.json(
          { error: "Plaid public token is required to verify the account" },
          { status: 400 },
        );
      } else if (!plaidProcessorToken) {
        plaidProcessorToken =
          suppliedProcessorToken || `mock_processor_${employee.id}_${Date.now()}`;
      }
    }

    await db
      .update(employeeBankAccounts)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(employeeBankAccounts.employeeId, employee.id));

    const [savedAccount] = await db
      .insert(employeeBankAccounts)
      .values({
        employeeId: employee.id,
        bankName,
        routingNumber,
        accountNumberMasked,
        accountType,
        verificationStatus,
        bankLogoUrl,
        plaidAccountId,
        plaidProcessorToken,
        isPrimary: true,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      bankAccount: publicBankAccount(savedAccount),
      message:
        verificationStatus === "Verified"
          ? "Bank account verified instantly — ready for direct deposit"
          : "Manual bank account saved — micro-deposit verification pending",
    });
  } catch (error: any) {
    console.error("[Employee Bank Account POST Error]", error);
    return NextResponse.json(
      { error: "Failed to verify bank account" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await ensureBankAccountColumns();

    const employee = await getCurrentEmployee();
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(employeeBankAccounts)
      .where(
        and(
          eq(employeeBankAccounts.employeeId, employee.id),
          eq(employeeBankAccounts.isPrimary, true),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Employee Bank Account DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to remove bank account" },
      { status: 500 },
    );
  }
}
