import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cora-persona-backend.vercel.app';

  try {
    const body = await req.json();
    const response = await axios.post(`${backendUrl}/api/push/subscribe`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Subscribe to web push proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
