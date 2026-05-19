import { NextRequest, NextResponse } from 'next/server';
import { getShopInfo, getCustomerCount, getOrderCount, getRecentOrders } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const [shop, customerCount, orderCount, recentOrders] = await Promise.all([
      getShopInfo(),
      getCustomerCount(),
      getOrderCount(),
      getRecentOrders(undefined, 10)
    ]);

    // Calculate revenue from recent orders (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRevenue = recentOrders
      .filter(o => new Date(o.created_at) > thirtyDaysAgo)
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    return NextResponse.json({
      shop,
      stats: {
        customerCount,
        orderCount,
        recentRevenue: recentRevenue.toFixed(2),
        currency: shop.currency,
      },
      recentOrders
    });
  } catch (error: any) {
    console.error('Stats API error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
