"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Check, Copy, Settings, Bell, Database, Code, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:4000/api/settings', { withCredentials: true });
      return res.data;
    }
  });

  useEffect(() => {
    if (data?.syncStatus?.status === 'in_progress') {
      const interval = setInterval(() => refetch(), 5000);
      return () => clearInterval(interval);
    }
  }, [data?.syncStatus?.status, refetch]);

  const startSyncMutation = useMutation({
    mutationFn: async () => {
      return axios.post('http://localhost:4000/api/sync/initial', { storeId: data.store.id }, { withCredentials: true });
    },
    onSuccess: () => {
      setSyncing(true);
      refetch();
    }
  });

  const snippet = `
<div id="cora-optin"></div>
<script src="https://api.cora.in/widgets/whatsapp-optin.js" defer></script>
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return <div className="p-8 animate-pulse text-[#616161]">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Settings</h1>
        <p className="text-[#616161] mt-1 text-sm">Manage your store connections and workspace preferences.</p>
      </div>

      <section className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-[#F7F7F7] rounded-xl flex items-center justify-center mr-4 border border-[#E5E5E5]">
            <Database className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="text-lg font-bold">Data Sources</h2>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-lg mr-2">🛍️</span>
                <span className="font-bold text-sm">Shopify</span>
              </div>
              <span className="px-2 py-1 bg-[#F0FDF4] text-[#16A34A] text-[10px] font-bold uppercase rounded-md border border-[#DCFCE7]">
                Connected
              </span>
            </div>
            <p className="text-sm text-[#616161] mb-4">Domain: <span className="text-[#111111] font-medium">{data.store.domain}</span></p>
            
            <div className="pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-widest mb-3">Sync Status</h3>
              {data.syncStatus ? (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{data.syncStatus.synced_customers} / {data.syncStatus.total_customers} Customers</p>
                    <p className="text-[10px] text-[#8a8a8a] uppercase">Status: {data.syncStatus.status}</p>
                  </div>
                  {data.syncStatus.status === 'in_progress' && <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />}
                </div>
              ) : (
                <p className="text-sm text-[#616161] mb-4">No sync history found.</p>
              )}
              
              <button 
                onClick={() => startSyncMutation.mutate()}
                disabled={data.syncStatus?.status === 'in_progress' || startSyncMutation.isPending}
                className="w-full sm:w-auto bg-[#111111] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50 shadow-sm"
              >
                {data.syncStatus?.status === 'in_progress' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-[#F7F7F7] rounded-xl flex items-center justify-center mr-4 border border-[#E5E5E5]">
            <Bell className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="text-lg font-bold">Channels</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-[#E5E5E5] rounded-xl">
             <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">WhatsApp</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
             </div>
             <p className="text-xs text-[#616161]">ID: {data.whatsapp.phoneNumberId}</p>
          </div>
          <div className="p-4 border border-[#E5E5E5] rounded-xl">
             <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Web Push</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
             </div>
             <p className="text-xs text-[#616161]">Configured via FCM</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-[#F7F7F7] rounded-xl flex items-center justify-center mr-4 border border-[#E5E5E5]">
            <Code className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="text-lg font-bold">Widget Snippet</h2>
        </div>
        <p className="text-sm text-[#616161] mb-6 leading-relaxed">
          Embed this snippet in your Shopify theme to collect customer opt-ins automatically.
        </p>
        <div className="relative group">
          <pre className="bg-[#111111] text-[#E5E5E5] p-6 rounded-2xl text-xs overflow-x-auto leading-loose">
            {snippet}
          </pre>
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-[#333333] text-[#EAEAEA] hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-[#444444]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
