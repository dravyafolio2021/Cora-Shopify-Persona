import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const body = await req.json();
    const { jobId, responded } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const response = await axios.post(`${backendUrl}/api/checkin/respond`, {
      jobId,
      responded: !!responded
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Check-in proxy error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to record check-in response' }, { status: 500 });
  }
}
