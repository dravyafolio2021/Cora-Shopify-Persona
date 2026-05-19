import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, computePersonas } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const { customers } = await getCustomers(undefined, 250);
    const withPersonas = computePersonas(customers);

    const filtered = search
      ? withPersonas.filter(c =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search)
        )
      : withPersonas;

    return NextResponse.json({ customers: filtered, total: filtered.length });
  } catch (error: any) {
    console.error('Customers API error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
