import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const { customerId } = await params;
    const response = await axios.get(`${backendUrl}/api/push/activities/${customerId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Fetch customer activities proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
