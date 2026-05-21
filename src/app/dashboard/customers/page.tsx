"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  Users, 
  ArrowRight, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Loader2, 
  Activity, 
  Clock, 
  TrendingUp, 
  Sparkles,
  Bell,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { PERSONA_META, PERSONA_COLORS, PERSONA_ICONS } from '@/lib/personas';
import Link from 'next/link';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  // Mutation to send a real push notification
  const sendPushMutation = useMutation({
    mutationFn: async (customerId: string) => {
      await axios.post('/api/store/campaigns/test', {
        customerId,
        channel: 'webpush',
        type: 'daily_reminder'
      });
    },
    onSuccess: () => {
      setTriggerSuccess(true);
      setTimeout(() => setTriggerSuccess(false), 5000);
    },
    onError: (err: any) => {
      alert(`Failed to send test push: ${err.response?.data?.error || err.message}`);
    }
  });

  // Mutation to unsubscribe/remove a specific push device
  const unsubscribeMutation = useMutation({
    mutationFn: async ({ customerId, endpoint }: { customerId: string; endpoint: string }) => {
      await axios.post('/api/store/campaigns/unsubscribe', {
        customerId,
        endpoint
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
    onError: (err: any) => {
      alert(`Failed to remove device: ${err.response?.data?.error || err.message}`);
    }
  });

  // Main customer list query
  const { data: listData, isLoading: isListLoading, error: listError } = useQuery({
    queryKey: ['customers', debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(`/api/store/customers?search=${encodeURIComponent(debouncedSearch)}`);
      return res.data;
    }
  });

  // Dynamic single customer detail query (for side drawer lifecycle)
  const { data: detailsData, isLoading: isDetailsLoading, error: detailsError } = useQuery({
    queryKey: ['customer-details', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const res = await axios.get(`/api/store/customers/${selectedCustomerId}`);
      return res.data;
    },
    enabled: !!selectedCustomerId
  });

  return (
    <div className="space-y-6 pb-20 font-sans relative">
      
      {/* 1. PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Customers</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {listData ? `${listData.total} customers segmented from connected Shopify store` : 'Analyzing catalog...'}
          </p>
        </div>
      </div>

      {/* 2. SEARCH BOX */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search by name, email, or segment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-shadow shadow-sm"
        />
      </div>

      {/* 3. CUSTOMER LIST */}
      {isListLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] h-16 animate-pulse" />
          ))}
        </div>
      )}

      {listError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load customers list. Make sure your Shopify custom app keys are connected in settings.
        </div>
      )}

      {listData && (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden md:table-cell">Persona Segment</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-right hidden sm:table-cell">Orders</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-right">Total Spent</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {listData.customers.map((customer: any) => {
                const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || '?';
                const totalSpent = parseFloat(customer.total_spent || '0');

                return (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#111111] to-[#555555] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${PERSONA_COLORS[customer.persona] || 'bg-gray-100 text-gray-700'}`}>
                        {(() => { const Icon = PERSONA_ICONS[customer.persona]; return Icon ? <Icon className="w-3 h-3" /> : null; })()} {customer.persona}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#374151] font-medium hidden sm:table-cell">
                      {customer.orders_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#111111]">
                        ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#111111] group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {listData.customers.length === 0 && (
            <div className="p-12 text-center text-[#9CA3AF]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No customers found{search ? ` for "${search}"` : ''}.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. CUSTOMER INTERACTIVE DETAILS SIDEBAR DRAWER */}
      {/* Backdrop blur overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-[#111111]/30 backdrop-blur-sm transition-opacity duration-300 ${
          selectedCustomerId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedCustomerId(null)}
      />

      {/* Slide Out Panel */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] md:w-[600px] bg-white border-l border-[#E5E5E5] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          selectedCustomerId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#111111]">Profile Details</span>
            {detailsData && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PERSONA_COLORS[detailsData.customer.persona]}`}>
                {detailsData.customer.persona}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedCustomerId && (
              <Link 
                href={`/dashboard/customers/${selectedCustomerId}`}
                className="px-3 py-1.5 bg-[#111111] text-white text-[11px] font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 mr-2"
              >
                View Full Profile <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <button 
              onClick={() => setSelectedCustomerId(null)}
              className="p-1.5 rounded-lg text-[#616161] hover:bg-[#EAEAEA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {isDetailsLoading && (
            <div className="flex flex-col items-center justify-center h-96 gap-3">
              <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
              <p className="text-xs text-[#9CA3AF]">Analyzing customer lifecycle...</p>
            </div>
          )}

          {detailsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              Failed to load detailed customer profile metrics.
            </div>
          )}

          {detailsData && (
            <>
              {/* Profile card summary */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#111111] to-[#555555] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {`${detailsData.customer.first_name?.[0] || ''}${detailsData.customer.last_name?.[0] || ''}`.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">
                    {detailsData.customer.first_name} {detailsData.customer.last_name}
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(detailsData.customer.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Core metrics summary box */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl text-center">
                <div>
                  <p className="text-lg font-bold text-[#111111]">{detailsData.customer.orders_count}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">Total Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#111111]">₹{parseFloat(detailsData.totalSpent).toLocaleString()}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">Total Value</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#111111]">
                    ₹{detailsData.customer.orders_count > 0 ? (parseFloat(detailsData.totalSpent) / detailsData.customer.orders_count).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">Avg Order (AOV)</p>
                </div>
              </div>

              {/* Shopify contact profile */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Contact Information</h4>
                <div className="space-y-3 text-xs bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm">
                  {detailsData.customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="text-[#374151]">{detailsData.customer.email}</span>
                    </div>
                  )}
                  {detailsData.customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="text-[#374151]">{detailsData.customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#374151]">
                      {detailsData.customer.default_address?.city || 'No Address'}, {detailsData.customer.default_address?.country_name || 'Connected Store'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CORA WEB PUSH OUTREACH CONSOLE */}
              {(() => {
                const customer = detailsData.customer;
                const registrationUrl = typeof window !== 'undefined' 
                  ? `${window.location.origin}/register-device?customerId=${customer.id}`
                  : `/register-device?customerId=${customer.id}`;

                const handleCopyLink = () => {
                  navigator.clipboard.writeText(registrationUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                };

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
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-purple-600" />
                        Cora Outreach Device Registration
                      </h4>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Hook up your test mobile phone to trigger lock-screen reminders for this specific customer.
                      </p>
                    </div>

                    {isSubscribed ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                          <p className="text-[10px] font-bold text-green-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                            🟢 Synced Devices ({subArray.length})
                          </p>

                          {sendPushMutation.isPending ? (
                            <button
                              disabled
                              className="px-2.5 py-1 bg-[#111111] text-white text-[9px] font-bold rounded-md flex items-center gap-1"
                            >
                              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Firing All...
                            </button>
                          ) : (
                            <button
                              onClick={() => sendPushMutation.mutate(customer.id)}
                              className="px-2.5 py-1 bg-[#111111] text-white text-[9px] font-bold rounded-md hover:bg-black transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Send className="w-2.5 h-2.5" /> Trigger Push (All)
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-[#F3F4F6] bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] overflow-hidden">
                          {subArray.map((sub: any, idx: number) => (
                            <div key={sub.endpoint || idx} className="p-3 flex items-center justify-between gap-4 text-[10px]">
                              <div>
                                <p className="font-bold text-[#111111]">
                                  📱 {sub.device_name || `Device #${idx + 1}`}
                                </p>
                                <p className="text-[9px] text-[#6B7280] mt-0.5 font-mono truncate max-w-[180px]">
                                  {sub.endpoint ? sub.endpoint.substring(0, 45) + '...' : 'FCM Registered'}
                                </p>
                              </div>

                              <button
                                onClick={() => unsubscribeMutation.mutate({ customerId: customer.id, endpoint: sub.endpoint })}
                                disabled={unsubscribeMutation.isPending}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 font-bold rounded-md border border-red-200 transition-colors flex-shrink-0"
                              >
                                {unsubscribeMutation.isPending && unsubscribeMutation.variables?.endpoint === sub.endpoint ? 'Removing...' : '❌ Remove'}
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Link New Device Option */}
                        <div className="pt-2 border-t border-dashed border-[#E5E5E5] space-y-2">
                          <p className="text-[9px] text-[#6B7280]">
                            🔗 Scan or copy link on another device to sync a 2nd/3rd device:
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={registrationUrl}
                              className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] px-2.5 py-1.5 rounded-lg text-[9px] text-[#6B7280] font-mono outline-none"
                            />
                            <button
                              onClick={handleCopyLink}
                              className="px-2.5 py-1.5 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded-lg text-[10px] font-bold text-[#111111] flex items-center gap-1 flex-shrink-0 transition-all active:scale-95"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-700 leading-relaxed">
                          <p className="font-bold text-amber-800">🟡 Phone Device Not Linked</p>
                          For mobile browser lockscreen alerts, scan or open the private test subscription link on your phone:
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={registrationUrl}
                            className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] px-2.5 py-1.5 rounded-lg text-[9px] text-[#6B7280] font-mono outline-none"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded-lg text-[10px] font-bold text-[#111111] flex items-center gap-1 flex-shrink-0 transition-all active:scale-95"
                          >
                            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {triggerSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-1.5 animate-bounce text-[10px] text-green-800 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        Test notification successfully dispatched to physical phone!
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* GORGEOUS VISUAL CUSTOMER LIFECYCLE TIMELINE */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  Cora Segment Lifecycle Timeline
                </h4>
                
                <div className="relative pl-6 border-l-2 border-[#E5E5E5] space-y-6 text-xs ml-3">
                  
                  {/* Stage 1: Joined */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-white border-2 border-[#111111] rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#111111] rounded-full"></span>
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-[#111111]">Account Created on Shopify</p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {new Date(detailsData.customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-[#616161] leading-relaxed">
                        Registered client profile in database. Marketing channels scanned.
                      </p>
                    </div>
                  </div>

                  {/* Stage 2: First order */}
                  {detailsData.orders.length > 0 && (
                    <div className="relative">
                      <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-white border-2 border-[#10B981] rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-[#111111]">First Purchase Placed</p>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {new Date(detailsData.orders[detailsData.orders.length - 1].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-[#616161] leading-relaxed">
                          Ordered {detailsData.orders[detailsData.orders.length - 1].name} for ₹{parseFloat(detailsData.orders[detailsData.orders.length - 1].total_price).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Persona Tagged */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-white border-2 border-[#7C3AED] rounded-full flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-[#7C3AED]" />
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-[#111111]">Segmented as "{detailsData.customer.persona}"</p>
                      <p className="text-[10px] text-[#9CA3AF]">Real-time AI Segmentation Sync</p>
                      <p className="text-[10px] text-[#616161] leading-relaxed">
                        Cora computed relative spend indexing and transactional frequency to assign this user to the **{detailsData.customer.persona}** cohort.
                      </p>
                    </div>
                  </div>

                  {/* Stage 4: Campaigns eligibility */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-white border-2 border-[#2563EB] rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-pulse"></span>
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-[#111111]">Outreach Target Active</p>
                      <p className="text-[10px] text-[#2563EB] font-bold">Campaign Trigger Eligible</p>
                      <p className="text-[10px] text-[#616161] leading-relaxed">
                        Currently verified for smart re-engagement campaign triggers inside the primary Overview panel.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Order history list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#111111]" />
                  Order History Feed ({detailsData.orders.length})
                </h4>
                
                <div className="divide-y divide-[#F3F4F6] border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                  {detailsData.orders.map((order: any) => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111111]">{order.name}</p>
                          <p className="text-[10px] text-[#9CA3AF]">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#111111]">₹{parseFloat(order.total_price).toLocaleString()}</p>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                          order.financial_status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {order.financial_status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {detailsData.orders.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#9CA3AF]">No Shopify orders associated.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-[#E5E5E5] bg-[#F9FAFB] flex justify-end">
          <button 
            onClick={() => setSelectedCustomerId(null)}
            className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-colors shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </aside>

    </div>
  );
}
