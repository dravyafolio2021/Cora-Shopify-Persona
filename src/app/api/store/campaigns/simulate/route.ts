import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cora-persona-backend.vercel.app';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const { jobId, response } = await req.json();
    const internalToken = jwt.sign({ userId: 'dev_user' }, jwtSecret);
    const apiResponse = await axios.post(`${backendUrl}/api/campaigns/simulate`, {
      jobId,
      response
    }, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(apiResponse.data);
  } catch (error: any) {
    console.error('Simulate campaign response proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
