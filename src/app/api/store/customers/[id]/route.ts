import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, getOrdersByCustomer, computePersonas } from '@/lib/shopify';
import axios from 'axios';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const { id } = await params;
    const [customer, orders] = await Promise.all([
      getCustomerById(id),
      getOrdersByCustomer(id)
    ]);

    // Fetch local PostgreSQL push subscription details for this customer
    let pushSubscription = null;
    try {
      const subRes = await axios.get(`${backendUrl}/api/push/subscription-status/${id}`);
      pushSubscription = subRes.data.push_subscription;
    } catch (e: any) {
      console.warn('Failed to fetch subscription status from backend:', e.message);
    }

    const [withPersona] = computePersonas([customer]);
    (withPersona as any).push_subscription = pushSubscription;

    const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    return NextResponse.json({ customer: withPersona, orders, totalSpent: totalSpent.toFixed(2) });
  } catch (error: any) {
    console.error('Customer detail API error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
