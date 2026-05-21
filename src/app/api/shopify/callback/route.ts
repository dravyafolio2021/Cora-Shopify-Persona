import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');

  if (!shop || !code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed&details=Missing+required+parameters+from+Shopify', req.url));
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed&details=Missing+SHOPIFY_CLIENT_ID+or+SHOPIFY_CLIENT_SECRET+in+production+environment+variables', req.url));
  }

  try {
    // 1. Exchange code for permanent access token
    const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code
    });

    const { access_token } = response.data;

    // 2. Fetch shop name
    const shopifyRes = await axios.get(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token }
    });
    const shopName = shopifyRes.data.shop.name;

    // 3. Try to get Clerk userId — fall back to 'dev_user' if unavailable
    let userId = 'dev_user';
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) userId = clerkId;
    } catch {}

    // 4. Send token and store data to Node.js backend
    const internalToken = jwt.sign({ userId }, jwtSecret);
    await axios.post(`${backendUrl}/api/settings/store`, {
      domain: shop,
      accessToken: access_token,
      shopName
    }, {
      headers: { Authorization: `Bearer ${internalToken}` }
    });

    // 5. Redirect back to dashboard with success
    return NextResponse.redirect(new URL('/dashboard/settings?success=true', req.url));

  } catch (error: any) {
    const errorBody = error.response?.data;
    const detail = errorBody?.error_description || errorBody?.error || error.message;
    console.error('Shopify OAuth Callback Error:', detail);
    
    let detailStr = '';
    if (typeof detail === 'object') {
      if (detail.message === 'A server error has occurred' || detail.code === '500') {
        detailStr = 'The Vercel backend API crashed (500 Server Error). Please check Vercel Logs for cora-persona-backend.';
      } else {
        detailStr = JSON.stringify(detail);
      }
    } else {
      detailStr = String(detail);
      if (detailStr.includes('ECONNREFUSED')) {
         detailStr = 'Failed to connect to the backend server (ECONNREFUSED). Is it running?';
      }
    }
    
    return NextResponse.redirect(new URL(`/dashboard/settings?error=oauth_failed&details=${encodeURIComponent(detailStr)}`, req.url));
  }
}
