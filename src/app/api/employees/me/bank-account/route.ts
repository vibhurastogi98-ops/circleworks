import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function GET() {
  try {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      // Return a mock link token if no creds are configured
      return NextResponse.json({ link_token: 'mock-link-token-for-sandbox' });
    }

    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'emp-123' }, // mockup user ID
      client_name: 'CircleWorks App',
      products: ['auth'] as any,
      country_codes: ['US'] as any,
      language: 'en',
    });

    return NextResponse.json({ link_token: createTokenResponse.data.link_token });
  } catch (error: any) {
    console.error('Error generating Plaid link token:', error);
    return NextResponse.json({ error: 'Failed to generate link token' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { public_token, account_id, metadata } = await req.json();

    // Exchange public_token for access_token (Mocked handling if no creds)
    let accessToken = 'mock-access-token';
    let processorToken = 'mock-processor-token';
    
    if (process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET) {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token,
      });
      accessToken = response.data.access_token;

      // Mock creating processor token if it was for a specific processor like Dwolla/Stripe
      const processorResponse = await plaidClient.processorTokenCreate({
        access_token: accessToken,
        account_id: account_id,
        processor: 'dwolla' as any, // using any to avoid type complaints
      });
      processorToken = processorResponse.data.processor_token;
    }

    // In a real app we'd save the account_id and processorToken to DB for this user
    // Return success to the client with masked info
    const bankName = metadata?.institution?.name || 'Bank';
    const mask = metadata?.account?.mask || account_id.slice(-4);

    return NextResponse.json({
      success: true,
      bankAccount: {
        bankName,
        mask,
        accountType: metadata?.account?.subtype || 'checking',
        status: 'verified'
      }
    });

  } catch (error: any) {
    console.error('Error verifying bank with Plaid:', error);
    return NextResponse.json({ error: 'Failed to verify bank account' }, { status: 500 });
  }
}
