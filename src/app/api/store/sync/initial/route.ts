import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const body = await req.json();
    const internalToken = jwt.sign({ userId: 'dev_user' }, jwtSecret);
    const response = await axios.post(`${backendUrl}/api/sync/initial`, body, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Initial sync proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
