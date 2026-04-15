import { NextResponse } from 'next/server';
import { mockAgencyClients } from '@/data/mockAgencyBilling';

export async function GET() {
  return NextResponse.json(mockAgencyClients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newClient = {
    id: mockAgencyClients.length + 1,
    ...body,
  };
  // In a real app, we'd insert into DB here
  return NextResponse.json(newClient, { status: 201 });
}
