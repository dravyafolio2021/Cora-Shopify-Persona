"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Mail, Phone, MapPin, Calendar, Bell, Copy, Check, Sparkles, Loader2, Send } from 'lucide-react';
import { PERSONA_META, PERSONA_COLORS, PERSONA_ICONS } from '@/lib/personas';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  // Fetch customer details
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await axios.get(`/api/store/customers/${id}`);
      return res.data;
    }
  });

  // Fetch customer's notification activities
  const { data: activityData, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['customer-activities', id],
    queryFn: async () => {
      const res = await axios.get(`/api/store/activities/${id}`);
      return res.data;
    }
  });

  // Mutation to send a real push notification
  const sendPushMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/store/campaigns/test', {
        customerId: id,
        channel: 'webpush',
        type: 'daily_reminder'
      });
    },
    onSuccess: () => {
      setTriggerSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['customer-activities', id] });
      setTimeout(() => setTriggerSuccess(false), 5000);
    },
    onError: (err: any) => {
      alert(`Failed to send test push: ${err.response?.data?.error || err.message}`);
    }
  });

  // Mutation to unsubscribe/remove a specific push device
  const unsubscribeMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      await axios.post('/api/store/campaigns/unsubscribe', {
        customerId: id,
        endpoint
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer-activities', id] });
    },
    onError: (err: any) => {
      alert(`Failed to remove device: ${err.response?.data?.error || err.message}`);
    }
  });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="bg-white rounded-2xl border border-[#E5E5E5] h-48" />
      <div className="bg-white rounded-2xl border border-[#E5E5E5] h-64" />
    </div>
  );

  if (error || !data) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Failed to load customer data.
    </div>
  );

  const { customer, orders, totalSpent } = data;
  const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase();

  const registrationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/register-device?customerId=${customer.id}`
    : `/register-device?customerId=${customer.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe parse subscription status
  let pushSubscription: any = null;
  try {
    pushSubscription = typeof customer.push_subscription === 'string' 
      ? JSON.parse(customer.push_subscription) 
      : customer.push_subscription;
  } catch (e) {
    pushSubscription = customer.push_subscription;
  }

  // Parse into a clean array of devices
  let subArray: any[] = [];
  if (pushSubscription) {
    if (Array.isArray(pushSubscription)) {
      subArray = pushSubscription;
    } else if (pushSubscription.endpoint || pushSubscription.fcm_token) {
      subArray = [pushSubscription];
    }
  }

  const isSubscribed = subArray.length > 0;

  return (
    <div className="space-y-6 pb-20 max-w-4xl font-sans">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#111111] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#111111] to-[#555555] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111111]">{customer.first_name} {customer.last_name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${PERSONA_COLORS[customer.persona] || 'bg-gray-100 text-gray-700'}`}>
                {(() => { const Icon = PERSONA_ICONS[customer.persona]; return Icon ? <Icon className="w-4 h-4" /> : null; })()} {customer.persona}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#6B7280]">
              {customer.email && (
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{customer.email}</span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{customer.phone}</span>
              )}
              {customer.default_address?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {customer.default_address.city}, {customer.default_address.country}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Customer since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-[#E5E5E5]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#111111]">{customer.orders_count}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#111111]">₹{parseFloat(totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#111111]">
              {customer.orders_count > 0 ? `₹${(parseFloat(totalSpent) / customer.orders_count).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">Avg. Order Value</p>
          </div>
        </div>
      </div>

      {/* Real Web Push Notification & Outreach Console */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" /> Cora Native Outreach Console
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Test and manage live push notifications directed to this customer's physical mobile device or browser.
          </p>
        </div>

        {isSubscribed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <p className="text-xs font-bold text-green-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                🟢 Connected Outbound Devices ({subArray.length})
              </p>

              {sendPushMutation.isPending ? (
                <button
                  disabled
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Firing All Devices...
                </button>
              ) : (
                <button
                  onClick={() => sendPushMutation.mutate()}
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Trigger Test Push (All)
                </button>
              )}
            </div>

            <div className="divide-y divide-[#F3F4F6] bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] overflow-hidden">
              {subArray.map((sub: any, idx: number) => (
                <div key={sub.endpoint || idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[#111111] flex items-center gap-1.5">
                      📱 {sub.device_name || `Device #${idx + 1}`}
                    </p>
                    <p className="text-[10px] text-[#6B7280] mt-1 font-mono truncate max-w-[280px]">
                      {sub.endpoint ? sub.endpoint.substring(0, 60) + '...' : 'FCM Token'}
                    </p>
                  </div>

                  <button
                    onClick={() => unsubscribeMutation.mutate(sub.endpoint)}
                    disabled={unsubscribeMutation.isPending}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 font-bold rounded-xl border border-red-200 transition-all flex-shrink-0 active:scale-95 text-xs"
                  >
                    {unsubscribeMutation.isPending && unsubscribeMutation.variables === sub.endpoint ? 'Removing...' : '❌ Remove Device'}
                  </button>
                </div>
              ))}
            </div>

            {/* Scan Option */}
            <div className="pt-3 border-t border-dashed border-[#D1D5DB] space-y-3">
              <p className="text-xs font-bold text-[#111111]">📲 Link An Additional Test Phone:</p>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Open this private subscription URL directly on another test phone's browser to link a second device to this customer:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registrationUrl}
                  className="flex-1 bg-white border border-[#E5E5E5] px-3 py-2 rounded-xl text-[11px] text-[#6B7280] font-mono outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded-xl text-xs font-bold text-[#111111] flex items-center gap-1 flex-shrink-0 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-xs font-bold text-amber-800">🟡 No Physical Device Linked</p>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                In production, customers automatically grant notification permissions through the post-purchase skincare tracker widget on your Shopify store (**ekg7ga-00.myshopify.com**).
              </p>
            </div>

            <div className="p-5 border border-dashed border-[#D1D5DB] rounded-2xl space-y-3 bg-[#FAFAFA]">
              <p className="text-xs font-bold text-[#111111]">📲 Link Your Test Phone Instantly:</p>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Open this private subscription URL directly in your test phone's Safari/Chrome browser to instantly register your device as this customer for live push notification testing:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registrationUrl}
                  className="flex-1 bg-white border border-[#E5E5E5] px-3 py-2 rounded-xl text-[11px] text-[#6B7280] font-mono outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded-xl text-xs font-bold text-[#111111] flex items-center gap-1 flex-shrink-0 transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {triggerSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4.5 h-4.5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-800">
              Test notification fired! Your registered physical device will buzz and display the check-in lockscreen prompt shortly.
            </p>
          </div>
        )}
      </div>

      {/* Skincare Routine & Push Notification Activity Timeline */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-6">
          <h2 className="font-bold text-[#111111] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" /> Notification Activity & Routine Tracking
          </h2>
          <span className="text-[10px] font-bold bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
            Real-time Telemetry
          </span>
        </div>

        {isActivitiesLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : !activityData?.activities || activityData.activities.length === 0 ? (
          <div className="p-8 text-center text-[#9CA3AF]">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No notification activity recorded yet.</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Once you trigger a test push or respond to an alert, the real-time activity stream will populate here.</p>
          </div>
        ) : (
          <div className="relative border-l border-purple-100 ml-4 pl-6 space-y-6">
            {activityData.activities.map((act: any) => {
              let icon = '🔔';
              let badgeBg = 'bg-purple-50 text-purple-600 border-purple-100';
              if (act.activity_type === 'subscribe') {
                icon = '📱';
                badgeBg = 'bg-green-50 text-green-700 border-green-100';
              } else if (act.activity_type === 'unsubscribe') {
                icon = '❌';
                badgeBg = 'bg-red-50 text-red-700 border-red-100';
              } else if (act.activity_type === 'checkin_applied') {
                icon = '✅';
                badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              } else if (act.activity_type === 'checkin_later') {
                icon = '⏰';
                badgeBg = 'bg-amber-50 text-amber-700 border-amber-100';
              } else if (act.activity_type === 'checkin_opened') {
                icon = '👁️';
                badgeBg = 'bg-blue-50 text-blue-700 border-blue-100';
              } else if (act.activity_type === 'trigger_push') {
                icon = '⚡';
                badgeBg = 'bg-purple-50 text-purple-700 border-purple-100';
              }

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline dot */}
                  <span className={`absolute -left-10 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs border ${badgeBg} shadow-sm z-10 transition-transform group-hover:scale-110`}>
                    {icon}
                  </span>
                  
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-[#111111]">{act.details}</p>
                      <span className="text-[10px] text-[#9CA3AF] font-medium whitespace-nowrap">
                        {new Date(act.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {act.device_name && (
                      <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">
                        Device Context: {act.device_name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5]">
          <h2 className="font-bold text-[#111111]">Order History</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-10 text-center text-[#9CA3AF]">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {orders.map((order: any) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{order.name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{order.line_items?.length} item{order.line_items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#111111]">₹{parseFloat(order.total_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    order.financial_status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.financial_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.financial_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
