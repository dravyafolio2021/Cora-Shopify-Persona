"use client";
import { MessageCircle, Mail, Smartphone, Webhook, Clock } from 'lucide-react';

const CHANNELS = [
  { icon: MessageCircle, name: 'WhatsApp Business API', desc: 'Send persona-based campaigns via WhatsApp Cloud API. Supports templates, media, and quick replies.', status: 'Coming Soon' },
  { icon: Mail,          name: 'Email (Resend / SendGrid)', desc: 'Trigger automated transactional and marketing emails based on persona segment changes.', status: 'Coming Soon' },
  { icon: Smartphone,    name: 'SMS (Twilio)', desc: 'Send targeted SMS to At-Risk and High Value customers with personalised offers.', status: 'Coming Soon' },
  { icon: Webhook,       name: 'Outbound Webhooks', desc: 'POST real-time events to your own endpoint whenever a customer changes persona segment.', status: 'Coming Soon' },
];

export default function ChannelsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Channels</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Connect communication channels to reach customers based on their persona segment.</p>
      </div>

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
