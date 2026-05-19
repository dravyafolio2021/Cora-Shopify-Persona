import { ShoppingBag, MessageCircle, ShoppingCart, Mail, Headphones, Send, ArrowRight, CheckCircle2, Clock, Plug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const integrations: { name: string; status: string; icon: LucideIcon; category: string }[] = [
  { name: 'Shopify',           status: 'Connected',   icon: ShoppingBag,   category: 'Ecommerce' },
  { name: 'WhatsApp Business', status: 'Coming Soon', icon: MessageCircle, category: 'Communication' },
  { name: 'WooCommerce',       status: 'Available',   icon: ShoppingCart,  category: 'Ecommerce' },
  { name: 'Klaviyo',           status: 'Coming Soon', icon: Mail,          category: 'Marketing' },
  { name: 'Gorgias',           status: 'Coming Soon', icon: Headphones,    category: 'Support' },
  { name: 'Mailchimp',         status: 'Coming Soon', icon: Send,          category: 'Marketing' },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Integrations</h1>
        <p className="text-[#6B7280] mt-1 text-sm">Connect Cora to your existing tech stack to sync data and trigger messages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((app) => {
          const Icon = app.icon;
          return (
            <div key={app.name} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 bg-[#F3F4F6] rounded-xl flex items-center justify-center border border-[#E5E7EB]">
                    <Icon className="w-5 h-5 text-[#374151]" />
                  </div>
                  {app.status === 'Connected' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : app.status === 'Coming Soon' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" /> Soon
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-[#F3F4F6] text-[#6B7280] text-[10px] font-bold uppercase rounded-full border border-[#E5E7EB]">
                      Available
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">{app.category}</p>
                <h3 className="text-base font-bold text-[#111111]">{app.name}</h3>
              </div>
              <button
                disabled={app.status === 'Coming Soon'}
                className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  app.status === 'Coming Soon'
                    ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                    : app.status === 'Connected'
                    ? 'bg-[#111111] text-white hover:bg-[#333]'
                    : 'bg-white border border-[#E5E7EB] text-[#111111] hover:bg-[#F9FAFB]'
                }`}>
                <Plug className="w-3.5 h-3.5" />
                {app.status === 'Connected' ? 'Manage' : app.status === 'Coming Soon' ? 'Coming Soon' : 'Connect'}
                {app.status !== 'Coming Soon' && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
