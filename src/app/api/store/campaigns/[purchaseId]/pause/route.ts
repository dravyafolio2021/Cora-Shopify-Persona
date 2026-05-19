import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

type RouteContext = {
  params: Promise<{ purchaseId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { purchaseId } = await context.params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const internalToken = jwt.sign({ userId: 'dev_user' }, jwtSecret);
    const response = await axios.patch(`${backendUrl}/api/campaigns/${purchaseId}/pause`, {}, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Pause campaign proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
