import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  let userId: string | null = null;
  
  try {
    const { userId: clerkId } = await auth();
    userId = clerkId;
  } catch {
    // Clerk not initialized yet
  }

  if (!userId) userId = 'dev_user';

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const internalToken = jwt.sign({ userId }, jwtSecret);
    const response = await axios.get(`${backendUrl}/api/settings`, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching settings from backend:', error);
    return NextResponse.json({ store: null });
  }
}
