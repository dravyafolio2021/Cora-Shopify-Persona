import { NextRequest, NextResponse } from 'next/server';
import { getProducts, isProductFallback } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const products = await getProducts();
    return NextResponse.json({ products, isFallback: isProductFallback });
  } catch (error: any) {
    console.error('Products API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
