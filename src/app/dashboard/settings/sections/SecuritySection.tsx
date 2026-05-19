"use client";
import { useState } from 'react';
import { Key, Eye, EyeOff, Copy, Check, Lock, Server, Clock } from 'lucide-react';

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-[#F3F4F6] last:border-0">
      <div><p className="text-sm font-medium text-[#111111]">{label}</p>{hint && <p className="text-xs text-[#9CA3AF] mt-0.5">{hint}</p>}</div>
      <div className="flex-shrink-0 ml-8">{children}</div>
    </div>
  );
}

const FAKE_KEY = 'cora_live_xK9mN2pQrT7vW3yZ8aB4cD6eF0jL5';

export default function SecuritySection() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard.writeText(FAKE_KEY); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Security & API</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Manage API keys, authentication settings, and token security.</p>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-[#374151]" />
          <p className="text-sm font-bold text-[#111111]">Cora API Key</p>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-4">Use this key to authenticate requests to the Cora REST API from your own systems.</p>
        <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-3">
          <code className="flex-1 text-xs font-mono text-[#374151] truncate">
            {show ? FAKE_KEY : FAKE_KEY.replace(/[a-zA-Z0-9]/g, '•')}
          </code>
          <button onClick={() => setShow(s => !s)} className="text-[#9CA3AF] hover:text-[#111111] transition-colors p-1">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={copy} className="text-[#9CA3AF] hover:text-[#111111] transition-colors p-1">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-2">Keep this key secret. Do not expose it in client-side code or public repos.</p>
      </div>

      {/* Token Info */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <Row label="Shopify Token Type" hint="Authentication method used to call Shopify Admin API">
          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
            <Lock className="w-3.5 h-3.5" /> OAuth 2.0 Offline Token
          </span>
        </Row>
        <Row label="Token Storage" hint="Where access tokens are persisted">
          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
            <Server className="w-3.5 h-3.5" /> Server-side only (never sent to browser)
          </span>
        </Row>
        <Row label="Session Management" hint="Authentication provider">
          <span className="text-xs font-medium text-[#374151]">Clerk (JWT + Cookie)</span>
        </Row>
        <Row label="Shopify Webhook Verification" hint="Validates Shopify webhook payloads via HMAC-SHA256">
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" /> Not configured
          </span>
        </Row>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#F3F4F6]">
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Advanced Security</p>
        </div>
        {['Two-Factor Authentication (via Clerk)', 'IP Allowlist for API Access', 'Session Timeout Controls', 'Audit Log — track all admin actions'].map(f => (
          <Row key={f} label={f}>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">Coming Soon</span>
          </Row>
        ))}
      </div>
    </div>
  );
}
