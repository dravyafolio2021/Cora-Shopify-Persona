"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, ShoppingBag, DollarSign, TrendingUp, Clock, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['orders', debouncedSearch],
    queryFn: async () => {
      const res = await axios.get('/api/store/orders');
      return res.data;
    }
  });

  const ordersList = data?.orders || [];
  const filteredOrders = ordersList.filter((ord: any) => 
    ord.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    (ord.customer && `${ord.customer.first_name || ''} ${ord.customer.last_name || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  // Compute metrics
  const totalOrders = ordersList.length;
  const totalRevenue = ordersList.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || '0'), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingFulfillments = ordersList.filter((o: any) => !o.fulfillment_status || o.fulfillment_status === 'unfulfilled').length;

  return (
    <div className="space-y-8 pb-20 font-sans">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Orders</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Audit transactions, fulfillments, and active store revenue metrics.</p>
        </div>
        <div>
          <button 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#111111] hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Syncing...' : 'Sync Orders'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-[#111111]">{isLoading ? '...' : totalOrders}</p>
          </div>
          <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-[#111111]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-[#16A34A]">₹{isLoading ? '...' : totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="w-9 h-9 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#16A34A]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Average Ticket (AOV)</p>
            <p className="text-2xl font-bold text-[#7C3AED]">₹{isLoading ? '...' : avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="w-9 h-9 bg-[#EDE9FE] border border-[#DDD6FE] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Pending Fulfillments</p>
            <p className="text-2xl font-bold text-[#D97706]">{isLoading ? '...' : pendingFulfillments}</p>
          </div>
          <div className="w-9 h-9 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input 
          type="text" 
          placeholder="Search by order number or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-shadow shadow-sm"
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] h-16 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to fetch Shopify orders feed. Make sure your custom app keys are connected.
        </div>
      )}

      {/* Orders table list */}
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden sm:table-cell">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-right">Total Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-center">Payment Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-center hidden md:table-cell">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {filteredOrders.map((ord: any) => {
                const total = parseFloat(ord.total_price || '0');
                const customerName = ord.customer 
                  ? `${ord.customer.first_name} ${ord.customer.last_name}` 
                  : 'Guest Checkout';

                return (
                  <tr key={ord.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    {/* Order ID/Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[#111111]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">
                            {ord.name}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{ord.line_items?.length || 1} item(s)</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-[#374151] font-medium">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 hidden sm:table-cell text-[#6B7280]">
                      {customerName}
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 text-right font-bold text-[#111111]">
                      ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ord.financial_status === 'paid' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {ord.financial_status}
                      </span>
                    </td>

                    {/* Fulfillment */}
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ord.fulfillment_status === 'fulfilled' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {ord.fulfillment_status || 'unfulfilled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-[#9CA3AF]">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
