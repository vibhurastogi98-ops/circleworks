import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";

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

export async function POST() {
  try {
    // If no credentials, return a mock token for development
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      console.warn("[Plaid] Missing credentials, returning mock token for dev mode");
      return NextResponse.json({ 
        link_token: "mock_token_" + Math.random().toString(36).substring(7),
        is_mock: true 
      });
    }

    const configs = {
      user: { client_user_id: "user-id-" + Math.random().toString(36).substring(7) },
      client_name: "CircleWorks",
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
    };

    const response = await client.linkTokenCreate(configs);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[Plaid Link Token Error]", error);
    // Fallback for development if API fails due to config
    return NextResponse.json({ 
      link_token: "mock_token_fallback_" + Math.random().toString(36).substring(7),
      is_mock: true 
    });
  }
}
