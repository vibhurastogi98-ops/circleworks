import { NextResponse } from 'next/server';
import { mockAgencyInvoices } from '@/data/mockAgencyBilling';

export async function GET() {
  return NextResponse.json(mockAgencyInvoices);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newInvoice = {
    id: mockAgencyInvoices.length + 1,
    ...body,
    status: 'Draft',
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json(newInvoice, { status: 201 });
}
