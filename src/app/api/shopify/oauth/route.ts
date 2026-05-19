import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('shop');

  if (!domain) {
    return NextResponse.json({ error: 'Missing shop domain parameter' }, { status: 400 });
  }

  let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanDomain.includes('.')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/shopify/callback`;
  
  const scopes = 'read_customers,read_orders,read_products,read_inventory';

  if (!clientId) {
    return NextResponse.json({ 
      error: 'Missing SHOPIFY_CLIENT_ID in .env.local. Please add it and restart the server.' 
    }, { status: 500 });
  }

  // Use a random state to prevent CSRF — we'll resolve the userId in the callback
  const state = Buffer.from(JSON.stringify({ domain: cleanDomain, ts: Date.now() })).toString('base64');

  const authUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(authUrl);
}
