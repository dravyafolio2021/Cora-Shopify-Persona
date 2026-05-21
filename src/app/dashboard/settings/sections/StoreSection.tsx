"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Globe, ExternalLink, Copy, Check, RefreshCw, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-[#F3F4F6] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#111111]">{label}</p>
        {hint && <p className="text-xs text-[#9CA3AF] mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0 ml-8">{children}</div>
    </div>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md">
      <Check className="w-3 h-3" />{scope}
    </span>
  );
}

export default function StoreSection({ storeData }: { storeData: any }) {
  const [domain, setDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const store = storeData?.store;
  const isConnected = !!store;

  const copy = (v: string) => { navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const detailsParam = searchParams.get('details');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Store & Connection</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Manage your connected Shopify store and OAuth access.</p>
      </div>

      {errorParam === 'oauth_failed' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm animate-shake">
          <AlertCircle className="w-4.5 h-4.5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">OAuth Installation Failed</p>
            <p className="text-xs text-red-700 mt-1 font-medium">
              {detailsParam || "Failed to exchange authorization token with Shopify. Please verify your client secret, access scopes, and URL callback endpoints."}
            </p>
          </div>
        </div>
      )}

      {isConnected ? (
        <>
          {/* Store card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#5E8E3E] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111]">{store.shopName}</p>
                  <p className="text-xs text-[#6B7280]">{store.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
                <a href={`https://${store.domain}/admin`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111111] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:border-[#111111] transition-colors">
                  Shopify Admin <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Row label="Connected Since" hint="OAuth token was granted on this date">
              <span className="text-sm text-[#374151]">
                {store.connectedAt && !isNaN(new Date(store.connectedAt).getTime()) 
                  ? new Date(store.connectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Just now'}
              </span>
            </Row>
            <Row label="Store Domain">
              <div className="flex items-center gap-2 font-mono text-xs bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-1.5 rounded-lg">
                {store.domain}
                <button onClick={() => copy(store.domain)}>
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-[#111111]" />}
                </button>
              </div>
            </Row>
            <Row label="OAuth Scopes" hint="Permissions Cora has on your store">
              <div className="flex flex-wrap gap-2">
                <ScopeBadge scope="read_customers" />
                <ScopeBadge scope="read_orders" />
                <ScopeBadge scope="read_products" />
                <ScopeBadge scope="read_inventory" />
              </div>
            </Row>
            <Row label="Token Type" hint="Authentication method in use">
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Lock className="w-3.5 h-3.5" /> OAuth 2.0 Access Token
              </span>
            </Row>
          </div>

          {/* Reconnect */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <p className="text-sm font-bold text-[#111111] mb-0.5">Reconnect Store</p>
            <p className="text-xs text-[#6B7280] mb-4">Re-run the OAuth flow if your token has been revoked or rotated.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="your-store.myshopify.com" value={domain} onChange={e => setDomain(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              <button disabled={!domain} onClick={() => domain && (window.location.href = `/api/shopify/oauth?shop=${encodeURIComponent(domain)}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-semibold rounded-lg hover:bg-[#333] disabled:opacity-40 transition-colors">
                <RefreshCw className="w-4 h-4" /> Reconnect
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">No store is connected. Enter your Shopify domain and authorise Cora via OAuth.</p>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="your-store.myshopify.com" value={domain} onChange={e => setDomain(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            <button disabled={!domain} onClick={() => domain && (window.location.href = `/api/shopify/oauth?shop=${encodeURIComponent(domain)}`)}
              className="px-5 py-2 bg-[#111111] text-white text-sm font-semibold rounded-lg hover:bg-[#333] disabled:opacity-40 transition-colors">
              Connect with Shopify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
