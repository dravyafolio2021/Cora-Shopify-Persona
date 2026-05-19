import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const body = await req.json();
    const response = await axios.post(`${backendUrl}/api/push/unsubscribe`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Unsubscribe device proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
