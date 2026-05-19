import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, computePersonas, PERSONA_META } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const { customers } = await getCustomers(undefined, 250);
    const withPersonas = computePersonas(customers);

    // Group customers by persona
    const groups: Record<string, any[]> = {};
    for (const customer of withPersonas) {
      const p = (customer as any).persona;
      if (!groups[p]) groups[p] = [];
      groups[p].push(customer);
    }

    const personas = Object.entries(PERSONA_META).map(([name, meta]) => {
      const members = groups[name] || [];
      const totalRevenue = members.reduce((sum, c) => sum + parseFloat(c.total_spent || '0'), 0);
      const avgRevenue = members.length > 0 ? totalRevenue / members.length : 0;

      return {
        name,
        ...meta,
        count: members.length,
        totalRevenue: totalRevenue.toFixed(2),
        avgRevenue: avgRevenue.toFixed(2),
        members: members.slice(0, 5) // preview of top 5 members
      };
    }).filter(p => p.count > 0);

    return NextResponse.json({ personas, total: withPersonas.length });
  } catch (error: any) {
    console.error('Personas API error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
