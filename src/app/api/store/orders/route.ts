import { NextRequest, NextResponse } from 'next/server';
import { getRecentOrders } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const orders = await getRecentOrders();
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
