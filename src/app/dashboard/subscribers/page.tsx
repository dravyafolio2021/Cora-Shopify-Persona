"use client";

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { 
  Bell, 
  Users, 
  Smartphone, 
  Send, 
  Loader2, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function SubscribersPage() {
  const [successCustomerId, setSuccessCustomerId] = useState<string | null>(null);

  // Fetch all registered subscribers
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['push-subscribers'],
    queryFn: async () => {
      const res = await axios.get('/api/store/subscribers');
      return res.data;
    }
  });

  // Mutation to send test push alert
  const testPushMutation = useMutation({
    mutationFn: async (customerId: string) => {
      await axios.post('/api/store/campaigns/test', {
        customerId,
        channel: 'webpush',
        type: 'daily_reminder'
      });
    },
    onSuccess: (_, customerId) => {
      setSuccessCustomerId(customerId);
      setTimeout(() => setSuccessCustomerId(null), 5000);
    },
    onError: (err: any) => {
      alert(`Test notification failed: ${err.response?.data?.error || err.message}`);
    }
  });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="bg-white rounded-2xl border border-[#E5E5E5] h-64" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Failed to load push notification subscribers.
    </div>
  );

  const subscribers = data?.subscribers || [];

  const totalSyncedDevices = subscribers.reduce((acc: number, sub: any) => {
    let pushSub: any = null;
    try {
      pushSub = typeof sub.push_subscription === 'string' ? JSON.parse(sub.push_subscription) : sub.push_subscription;
    } catch(e) {}
    if (Array.isArray(pushSub)) {
      return acc + pushSub.length;
    } else if (pushSub?.endpoint || pushSub?.fcm_token) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Subscribed Devices</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Real-time registry of customer physical devices synced for native push notification routine tracking.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111111]">{totalSyncedDevices}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Total Synced Devices</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111111]">100%</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Device Permission Rate</p>
          </div>
        </div>
      </div>

      {/* Table List of Subscribers */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Shopify Customer ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Device Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Linked At</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6] text-xs">
            {subscribers.map((sub: any) => {
              const initials = `${sub.first_name?.[0] || ''}${sub.last_name?.[0] || ''}`.toUpperCase() || 'C';
              
              // Safe parse subscription date
              let subscribedAt = new Date(sub.created_at);
              let subObj: any = null;
              try {
                subObj = typeof sub.push_subscription === 'string' ? JSON.parse(sub.push_subscription) : sub.push_subscription;
              } catch(e) {}

              let subArray: any[] = [];
              if (subObj) {
                if (Array.isArray(subObj)) {
                  subArray = subObj;
                } else if (subObj.endpoint || subObj.fcm_token) {
                  subArray = [subObj];
                }
              }

              if (subArray[0]?.subscribed_at) {
                subscribedAt = new Date(subArray[0].subscribed_at);
              }

              const deviceCount = subArray.length;

              return (
                <tr key={sub.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#111111] to-[#555555] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">
                          {sub.first_name} {sub.last_name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{sub.email || sub.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[#6B7280]">
                    {sub.shopify_customer_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold text-green-700">
                        🟢 Active ({deviceCount} device{deviceCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      {subscribedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {successCustomerId === sub.shopify_customer_id ? (
                        <span className="px-3 py-1.5 bg-green-50 text-green-700 font-bold rounded-lg flex items-center gap-1 text-[10px] animate-bounce border border-green-200">
                          <Check className="w-3 h-3" /> Fired!
                        </span>
                      ) : testPushMutation.isPending && testPushMutation.variables === sub.shopify_customer_id ? (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" /> Firing...
                        </button>
                      ) : (
                        <button
                          onClick={() => testPushMutation.mutate(sub.shopify_customer_id)}
                          className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Send className="w-3 h-3" /> Send Test Push
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-[#9CA3AF]">
                  <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No registered devices found.</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Once customers subscribe their phone via Shopify or your private test links, they will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
