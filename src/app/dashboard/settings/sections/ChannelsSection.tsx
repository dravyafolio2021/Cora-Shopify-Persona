"use client";
import { useState } from 'react';
import { MessageCircle, Mail, Smartphone, Webhook, Clock, Code, Copy, Check, Sparkles, User } from 'lucide-react';

const CHANNELS = [
  { icon: MessageCircle, name: 'WhatsApp Business API', desc: 'Send persona-based campaigns via WhatsApp Cloud API. Supports templates, media, and quick replies.', status: 'Coming Soon' },
  { icon: Mail,          name: 'Email (Resend / SendGrid)', desc: 'Trigger automated transactional and marketing emails based on persona segment changes.', status: 'Coming Soon' },
  { icon: Smartphone,    name: 'SMS (Twilio)', desc: 'Send targeted SMS to At-Risk and High Value customers with personalised offers.', status: 'Coming Soon' },
  { icon: Webhook,       name: 'Outbound Webhooks', desc: 'POST real-time events to your own endpoint whenever a customer changes persona segment.', status: 'Coming Soon' },
];

export default function ChannelsSection() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const embedScript = `<!-- Cora Skincare Routine Sync Widget -->
<script 
  src="https://corapersona.vercel.app/widgets/cora-portal.js" 
  data-customer-id="{{ customer.id }}"
  async>
</script>`;

  const profileLiquid = `<!-- Cora Synced Luxury Customer Profile Page Embed -->
<div class="page-width" style="padding: 40px 0;">
  <div id="cora-profile-container">
    <!-- Embedded custom portal login / dashboard view -->
    <iframe 
      id="cora-profile-iframe"
      src="https://corapersona.vercel.app/portal-login" 
      style="width: 100%; height: 800px; border: none; border-radius: 24px; background: transparent; box-shadow: 0 4px 30px rgba(0,0,0,0.02);"
      loading="lazy">
    </iframe>
  </div>

  <script>
    (function() {
      const iframe = document.getElementById('cora-profile-iframe');
      
      // 1. Resolve active customer ID from URL search query parameter (important for lock screen deep-links), Shopify Liquid customer context, or local device cache
      let customerId = "";
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryId = urlParams.get('customerId');
        if (queryId) {
          customerId = queryId;
        }
      } catch (err) {
        console.warn('URLSearchParams not supported or errored:', err);
      }
      
      {% if customer %}
      if (!customerId) {
        customerId = "{{ customer.id }}";
      }
      {% endif %}
      
      const storedId = localStorage.getItem('cora_storefront_customer_id');
      if (!customerId && storedId) {
        customerId = storedId;
      }

      // 2. Load the custom profile if authenticated; otherwise, keep portal-login loaded
      if (customerId) {
        iframe.src = "https://corapersona.vercel.app/customer-profile?customerId=" + customerId;
      }

      // 3. Listen for postMessage updates from our custom embedded iframe
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'cora-login-success') {
          const loggedInId = event.data.customerId;
          localStorage.setItem('cora_storefront_customer_id', loggedInId);
          
          // Smooth transition to the custom skincare dashboard
          iframe.src = "https://corapersona.vercel.app/customer-profile?customerId=" + loggedInId;
        }
        if (event.data && event.data.type === 'cora-logout-success') {
          localStorage.removeItem('cora_storefront_customer_id');
          iframe.src = "https://corapersona.vercel.app/portal-login";
        }
        if (event.data && event.data.type === 'cora-resize') {
          // Adjust iframe height dynamically to prevent ugly scrolling
          iframe.style.height = event.data.height + 'px';
        }
      });
    })();
  </script>
</div>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(profileLiquid);
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Channels & Integrations</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Configure communications and storefront components to sync your customer segments.</p>
      </div>

      {/* Storefront Widget Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600 border border-purple-100">
            <Code className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              Cora Storefront Integration Widget <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Active</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Embed an interactive, emoji-free floating sync badge on your client's Shopify storefront. 
              The widget automatically detects logged-in Shopify customers and enables 1-click device registrations.
            </p>
          </div>
        </div>

        {/* Script Box */}
        <div className="relative bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-[#A7F3D0] border border-slate-800 overflow-x-auto select-all">
          <pre>{embedScript}</pre>
          <button
            onClick={handleCopyScript}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Copy script"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Integration Instructions */}
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-800 space-y-2">
          <p className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 fill-purple-800" /> Quick Install Instructions:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Log into your Shopify admin panel.</li>
            <li>Go to <b>Online Store</b> &gt; <b>Themes</b> &gt; <b>Edit Code</b>.</li>
            <li>Open the main <b>layout/theme.liquid</b> template file.</li>
            <li>Scroll to the bottom, paste the copied widget script right before the closing <b>&lt;/body&gt;</b> tag, and click <b>Save</b>!</li>
          </ol>
        </div>
      </div>

      {/* Customer Profile Page Embed Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-100">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              Branded Customer Profile Page Integration <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">New</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Create a dedicated, fully responsive customer skincare routine and habit streak page inside any core client storefront website. 
              Automatically scales for mobile devices and synchronizes logged-in customer data dynamically.
            </p>
          </div>
        </div>

        {/* Profile Page Liquid Box */}
        <div className="relative bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-[#93C5FD] border border-slate-800 overflow-x-auto select-all max-h-[160px]">
          <pre>{profileLiquid}</pre>
          <button
            onClick={handleCopyProfile}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Copy liquid code"
          >
            {copiedProfile ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Integration Instructions */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 space-y-2">
          <p className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 fill-indigo-800" /> Liquid Embed Instructions:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Open the Shopify Admin theme editor for the store.</li>
            <li>Under <b>Templates</b>, click <b>Add a new template</b>, choose <b>page</b>, and name it <b>skincare-profile</b>.</li>
            <li>Paste the copied liquid code template, save the file.</li>
            <li>Create a new page on Shopify under <b>Online Store &gt; Pages</b> called <b>My Skincare Profile</b>, and assign it the newly created <b>skincare-profile</b> template!</li>
          </ol>
        </div>
      </div>

      {/* Outbound Messaging Channels */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#111111]">Outbound Campaign Channels</h3>
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {CHANNELS.map((ch, i) => (
            <div key={ch.name} className={`flex items-start justify-between px-6 py-5 ${i < CHANNELS.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ch.icon className="w-4 h-4 text-[#374151]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{ch.name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 max-w-md">{ch.desc}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full ml-4 flex-shrink-0">
                <Clock className="w-3 h-3" /> {ch.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] p-5">
        <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Notification Preferences</p>
        {[
          'Email me when a customer enters At Risk segment',
          'Weekly persona summary report',
          'Alert on High Value customer churn risk',
        ].map(label => (
          <label key={label} className="flex items-center gap-3 py-2.5 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-[#D1D5DB] accent-[#111111]" />
            <span className="text-sm text-[#374151] group-hover:text-[#111111] transition-colors">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
