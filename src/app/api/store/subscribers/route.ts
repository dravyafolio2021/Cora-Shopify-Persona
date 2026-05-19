import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const response = await axios.get(`${backendUrl}/api/push/subscribers`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Fetch push subscribers proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
