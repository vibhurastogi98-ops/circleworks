import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
      "PLAID-SECRET": process.env.PLAID_SECRET || "",
    },
  },
});

const client = new PlaidApi(configuration);

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();

    // Mock response if no credentials
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      console.warn("[Plaid] Missing credentials, returning mock account data");
      return NextResponse.json({
        access_token: "mock_access_token_" + Math.random().toString(36).substring(7),
        item_id: "mock_item_id",
        mock_account: {
          name: "Plaid Checking (Mock)",
          routing: "012345678",
          account: "••••1111",
        },
      });
    }

    const response = await client.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;

    // Fetch account info (Auth product)
    const authResponse = await client.authGet({ access_token });
    const account = authResponse.data.accounts[0];
    const numbers = authResponse.data.numbers.ach[0];

    return NextResponse.json({
      access_token,
      item_id: response.data.item_id,
      account: {
        name: account.name,
        routing: numbers.routing,
        account: `••••${account.mask}`,
      },
    });
  } catch (error: any) {
    console.error("[Plaid Exchange Error]", error);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
