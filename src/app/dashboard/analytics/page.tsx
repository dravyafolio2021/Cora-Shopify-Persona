import { BarChart3, TrendingUp, DollarSign, MousePointer2 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Advanced Analytics</h1>
          <p className="text-[#616161] mt-1 text-sm">Measure the impact of Cora on your store's LTV and revenue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Attributed Revenue" value="$42,850" change="+12.5%" icon={DollarSign} />
        <StatCard title="Retention Lift" value="+18%" change="+2.3%" icon={TrendingUp} />
        <StatCard title="Msg Conversion" value="14.2%" change="-0.4%" icon={MousePointer2} />
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-20 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[#F7F7F7]/50 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-xl max-w-sm">
             <BarChart3 className="w-12 h-12 text-[#111111] mx-auto mb-4" />
             <h2 className="text-xl font-bold text-[#111111] mb-2">Beta Feature: Advanced ROI</h2>
             <p className="text-[#616161] text-sm mb-6 leading-relaxed">
               We're finalizing our revenue attribution model to show you exactly which Cora messages triggered which purchase.
             </p>
             <button className="w-full bg-[#111111] text-white py-3 rounded-xl font-medium hover:bg-[#333333] transition-colors">
               Join Waitlist
             </button>
          </div>
        </div>
        
        {/* Blurred background chart items */}
        <div className="space-y-4 opacity-10 select-none">
          <div className="h-4 bg-[#111111] rounded-full w-full"></div>
          <div className="h-4 bg-[#111111] rounded-full w-3/4"></div>
          <div className="h-4 bg-[#111111] rounded-full w-5/6"></div>
          <div className="h-4 bg-[#111111] rounded-full w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-[#F7F7F7] rounded-xl flex items-center justify-center text-[#616161]">
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold ${isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-sm font-medium text-[#616161] mb-1">{title}</h3>
      <p className="text-2xl font-bold text-[#111111] tracking-tight">{value}</p>
    </div>
  );
}
