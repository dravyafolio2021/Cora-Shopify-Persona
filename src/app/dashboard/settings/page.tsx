"use client";
import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Store, RefreshCw, Users, Zap, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import StoreSection from './sections/StoreSection';
import SyncSection from './sections/SyncSection';
import PersonaRulesSection from './sections/PersonaRulesSection';
import ChannelsSection from './sections/ChannelsSection';
import SecuritySection from './sections/SecuritySection';
import DangerSection from './sections/DangerSection';

const NAV = [
  { id: 'store',    label: 'Store & Connection', icon: Store },
  { id: 'sync',     label: 'Data & Sync',         icon: RefreshCw },
  { id: 'personas', label: 'Persona Rules',        icon: Users },
  { id: 'channels', label: 'Channels',             icon: Zap },
  { id: 'security', label: 'Security & API',       icon: Shield },
  { id: 'danger',   label: 'Danger Zone',          icon: AlertTriangle },
];

export default function SettingsPage() {
  const [active, setActive] = useState('store');
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await axios.get('/api/settings')).data
  });

  const renderSection = () => {
    switch (active) {
      case 'store':    return <StoreSection storeData={data} />;
      case 'sync':     return <SyncSection />;
      case 'personas': return <PersonaRulesSection />;
      case 'channels': return <ChannelsSection />;
      case 'security': return <SecuritySection />;
      case 'danger':   return <DangerSection />;
    }
  };

  return (
    <div className="flex gap-0 -mx-8 -mt-6 min-h-screen bg-[#F9FAFB]">
      {/* Left sidebar */}
      <aside className="w-64 border-r border-[#E5E7EB] bg-white flex-shrink-0 pt-8 pb-20">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Configuration</p>
        </div>
        <nav className="space-y-0.5 px-2">
          {NAV.map(item => {
            const on = active === item.id;
            const danger = item.id === 'danger';
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  on ? danger ? 'bg-red-50 text-red-600' : 'bg-[#F3F4F6] text-[#111111]'
                     : danger ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                               : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111111]'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {on && !danger && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-8 px-8 pb-20 max-w-4xl">
        <Suspense fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-7 w-48 bg-gray-200 rounded-lg" />
            <div className="h-4 w-72 bg-gray-100 rounded" />
            <div className="bg-white rounded-xl border border-[#E5E7EB] h-64" />
          </div>
        }>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-7 w-48 bg-gray-200 rounded-lg" />
              <div className="h-4 w-72 bg-gray-100 rounded" />
              <div className="bg-white rounded-xl border border-[#E5E7EB] h-64" />
            </div>
          ) : renderSection()}
        </Suspense>
      </main>
    </div>
  );
}
