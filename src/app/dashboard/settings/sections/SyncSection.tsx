"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  Clock, 
  Activity, 
  Layers, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

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

function Select({ options, defaultValue }: { options: string[]; defaultValue: string }) {
  return (
    <select defaultValue={defaultValue} className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#111111]">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function SyncSection() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<{ total: number; synced: number } | null>(null);

  // 1. Fetch connected store settings
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await axios.get('/api/settings')).data
  });

  const storeId = settingsData?.store?.id;
  const storeDomain = settingsData?.store?.shopify_domain;

  // 2. Fetch Sync Status periodically if sync is in progress
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['sync-status', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      try {
        const res = await axios.get(`/api/store/sync/status/${storeId}`);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!storeId,
    refetchInterval: syncing ? 1000 : false // Poll every second if active syncing
  });

  // Keep state synced with the server response
  useEffect(() => {
    if (syncStatus) {
      if (syncStatus.status === 'in_progress') {
        setSyncing(true);
        setProgress({
          total: syncStatus.total_customers || 0,
          synced: syncStatus.synced_customers || 0
        });
      } else {
        setSyncing(false);
        if (syncStatus.status === 'completed') {
          setProgress({
            total: syncStatus.total_customers || 0,
            synced: syncStatus.synced_customers || 0
          });
        }
      }
    }
  }, [syncStatus]);

  // 3. Mutation to trigger initial Shopify sync
  const triggerSyncMutation = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error('No store connected. Please connect your Shopify store first.');
      const res = await axios.post('/api/store/sync/initial', { storeId });
      return res.data;
    },
    onSuccess: () => {
      setSyncing(true);
      refetchSyncStatus();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  const handleSync = () => {
    triggerSyncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Data & Sync</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Control how Cora fetches and caches your Shopify data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Database, label: 'Storage', value: 'Neon PostgreSQL', sub: 'Production DB' },
          { icon: Clock, label: 'Cache TTL', value: '60s', sub: 'Per request' },
          { icon: Layers, label: 'Page Size', value: '50', sub: 'Customers per page' },
          { icon: Activity, label: 'API Calls', value: 'Real-time Webhooks', sub: 'Sync in background' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-9 h-9 bg-[#F3F4F6] rounded-lg flex items-center justify-center flex-shrink-0">
              <m.icon className="w-4 h-4 text-[#6B7280]" />
            </div>
            <div>
              <p className="text-base font-black text-[#111111]">{m.value}</p>
              <p className="text-xs text-[#9CA3AF]">{m.label} · {m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Sync Block with Live Progress */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111111]">Shopify Store Sync</p>
            {storeDomain ? (
              <p className="text-xs text-[#10B981] font-semibold mt-0.5">
                Connected to: {storeDomain}
              </p>
            ) : (
              <p className="text-xs text-amber-500 font-semibold mt-0.5">
                No active store connected. Connect via settings first.
              </p>
            )}
          </div>
          <button 
            onClick={handleSync} 
            disabled={syncing || !storeId || triggerSyncMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-sm font-semibold rounded-lg hover:bg-[#333] disabled:opacity-60 transition-all min-w-[130px] justify-center"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing...
              </>
            ) : triggerSyncMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : syncStatus?.status === 'completed' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Sync Complete
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Sync Now
              </>
            )}
          </button>
        </div>

        {/* Live Progress Bar */}
        {syncing && progress && (
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center font-semibold text-[#374151]">
              <span>Synchronizing Customer Profiles & Skincare Timeline</span>
              <span>
                {progress.synced} / {progress.total} Synced
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#111111] h-full rounded-full transition-all duration-300 animate-pulse" 
                style={{ width: `${progress.total > 0 ? (progress.synced / progress.total) * 100 : 5}%` }}
              />
            </div>
            <p className="text-[10px] text-[#9CA3AF]">
              Pulling historical orders and running AI skin diagnostics for routine consistency...
            </p>
          </div>
        )}

        {/* Success Alert */}
        {!syncing && syncStatus?.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-xs text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Sync Completed Successfully!</p>
              <p className="mt-0.5 text-green-700">
                Synced {syncStatus.synced_customers} customers and scheduled routine campaigns. Go to the dashboard or sandbox to view!
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {syncStatus?.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Sync Failed</p>
              <p className="mt-0.5 text-red-700">{syncStatus.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <Row label="Cache Duration" hint="How long Cora caches Shopify API responses">
          <Select options={['60 seconds (recommended)', '5 minutes', 'No cache']} defaultValue="60 seconds (recommended)" />
        </Row>
        <Row label="Customers Per Request" hint="Number of customers fetched per Shopify API page">
          <Select options={['50 (max)', '25', '10']} defaultValue="50 (max)" />
        </Row>
        <Row label="Order Fetch Scope" hint="Which orders are included in persona calculations">
          <Select options={['All time', 'Last 12 months', 'Last 6 months']} defaultValue="All time" />
        </Row>
        <Row label="Sync Mode" hint="How data is refreshed">
          <Select options={['On demand (manual)', 'Per page load']} defaultValue="On demand (manual)" />
        </Row>
      </div>
    </div>
  );
}
