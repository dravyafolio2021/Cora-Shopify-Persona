import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

// Helper to get/set mock DB
function getDb() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  return { stores: {} };
}

function saveDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain, accessToken } = await req.json();

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Domain and Access Token are required' }, { status: 400 });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // 1. Verify the token with Shopify
    try {
      let shopData;
      
      if (accessToken === 'demo') {
        shopData = { name: cleanDomain.split('.')[0] + ' (Demo)' };
      } else {
        const shopifyRes = await axios.get(`https://${cleanDomain}/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        });
        shopData = shopifyRes.data.shop;
      }

      // 2. Save to our local mock DB (Since Postgres is offline)
      const db = getDb();
      db.stores[userId] = {
        domain: cleanDomain,
        accessToken,
        shopName: shopData.name,
        connectedAt: new Date().toISOString()
      };
      saveDb(db);

      return NextResponse.json({ success: true, shop: shopData });
    } catch (shopifyError: any) {
      console.error('Shopify API Error:', shopifyError.response?.data || shopifyError.message);
      return NextResponse.json({ error: 'Invalid Shopify credentials or store not found.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
