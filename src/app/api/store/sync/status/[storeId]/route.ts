import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cora-persona-backend.vercel.app';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const internalToken = jwt.sign({ userId: 'dev_user' }, jwtSecret);
    const response = await axios.get(`${backendUrl}/api/sync/status/${storeId}`, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Sync status proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
