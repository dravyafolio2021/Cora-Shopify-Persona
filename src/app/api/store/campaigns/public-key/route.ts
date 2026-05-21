import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cora-persona-backend.vercel.app';

  try {
    const response = await axios.get(`${backendUrl}/api/push/public-key`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Fetch VAPID public key proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
