import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const internalToken = jwt.sign({ userId: 'dev_user' }, jwtSecret);
    const response = await axios.get(`${backendUrl}/api/campaigns/jobs`, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Jobs list proxy error:', error.message);
    return NextResponse.json({ jobs: [] });
  }
}
