"use client";
import { useState } from 'react';
import { Star, Heart, UserPlus, AlertTriangle, UserMinus, User, Info, Check } from 'lucide-react';

const PERSONAS = [
  { key: 'highValuePct',   icon: Star,        name: 'High Value',  desc: 'Top % of customers by total lifetime spend',   suffix: '%',      min: 5,  max: 50,  default: 20 },
  { key: 'loyalMinOrders', icon: Heart,       name: 'Loyal',       desc: 'Minimum number of completed orders',            suffix: ' orders', min: 2,  max: 20,  default: 3  },
  { key: 'newDays',        icon: UserPlus,    name: 'New',         desc: 'First order placed within the last N days',     suffix: ' days',   min: 7,  max: 90,  default: 30 },
  { key: 'atRiskDays',     icon: AlertTriangle, name: 'At Risk',   desc: 'No order placed in the last N days',            suffix: ' days',   min: 30, max: 365, default: 90 },
  { key: 'oneTimeOrders',  icon: UserMinus,   name: 'One-Time',    desc: 'Customers with exactly this many orders',       suffix: ' order',  min: 1,  max: 3,   default: 1  },
];

export default function PersonaRulesSection() {
  const [rules, setRules] = useState<Record<string, number>>({
    highValuePct: 20, loyalMinOrders: 3, newDays: 30, atRiskDays: 90, oneTimeOrders: 1
  });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Persona Rules</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Customise the thresholds used to automatically segment your customers.</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">Rule changes apply on the next data fetch. All persona assignments update automatically in real-time.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {PERSONAS.map((p, i) => (
          <div key={p.key} className={`flex items-center gap-4 px-6 py-5 ${i < PERSONAS.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
              <p.icon className="w-4 h-4 text-[#374151]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111111]">{p.name}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{p.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <input type="range" min={p.min} max={p.max} value={rules[p.key]}
                onChange={e => setRules(r => ({ ...r, [p.key]: +e.target.value }))}
                className="w-36 accent-[#111111]" />
              <div className="w-24 text-right">
                <span className="text-lg font-black text-[#111111]">{rules[p.key]}</span>
                <span className="text-xs text-[#9CA3AF] ml-0.5">{p.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Rule Summary Preview</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-[#374151]">
          <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#6B7280]">High Value threshold</span>
            <span className="font-semibold">Top {rules.highValuePct}% by spend</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#6B7280]">Loyal threshold</span>
            <span className="font-semibold">{rules.loyalMinOrders}+ orders</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#6B7280]">New customer window</span>
            <span className="font-semibold">Last {rules.newDays} days</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#6B7280]">At Risk threshold</span>
            <span className="font-semibold">{rules.atRiskDays}+ days inactive</span>
          </div>
        </div>
      </div>

      <button onClick={save}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111111] text-white text-sm font-semibold rounded-lg hover:bg-[#333] transition-colors">
        {saved ? <><Check className="w-4 h-4 text-green-400" /> Saved!</> : 'Save Persona Rules'}
      </button>
    </div>
  );
}
