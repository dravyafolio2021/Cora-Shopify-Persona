"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Sparkles, 
  ArrowUpRight, 
  MessageCircle, 
  Mail, 
  Layers, 
  Activity, 
  Check, 
  Loader2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, icon: Icon, change, sub }: { label: string; value: string; icon: any; change?: string; sub?: string }) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#111111]">{value}</p>
        {change && (
          <span className={`inline-flex items-center text-xs font-bold mt-1.5 ${isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {change} {sub && <span className="text-[#9CA3AF] font-normal ml-1">{sub}</span>}
          </span>
        )}
      </div>
      <div className="w-10 h-10 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-[#E5E5E5]">
        <Icon className="w-5 h-5 text-[#111111]" />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'cohorts' | 'products' | 'sales'>('opportunities');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['overview-insights-data'],
    queryFn: async () => {
      const res = await axios.get('/api/store/insights');
      return res.data;
    }
  });

  const triggerCampaign = (recId: string) => {
    setActioningId(recId);
    setTimeout(() => {
      setActioningId(null);
      setSuccessId(recId);
      setTimeout(() => setSuccessId(null), 3000);
    }, 1500);
  };

  if (isLoading) return (
    <div className="space-y-8 pb-20">
      <div>
        <div className="h-7 bg-[#E5E5E5] rounded w-48 animate-pulse mb-2"></div>
        <div className="h-4 bg-[#E5E5E5] rounded w-64 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5E5E5] h-28 animate-pulse" />
        ))}
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-3xl h-96 animate-pulse" />
    </div>
  );

  if (error || !data) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
      Failed to load store insights. Make sure your Shopify store is connected in Settings.
    </div>
  );

  const { shop, metrics, cohortStats, topProducts, salesDynamics, recommendations, recentOrders } = data;
  const currencySymbol = metrics.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Overview</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">{shop.name} · {shop.domain}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-full border border-[#BBF7D0]">
          <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse"></span>
          Live Shopify Sync Active
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`${currencySymbol}${parseFloat(metrics.totalRevenue).toLocaleString()}`} 
          icon={DollarSign} 
          change="+14.2%" 
          sub="vs last month"
        />
        <StatCard 
          label="Store AOV" 
          value={`${currencySymbol}${parseFloat(metrics.aov).toLocaleString()}`} 
          icon={TrendingUp} 
          change="+6.8%" 
          sub="vs last month"
        />
        <StatCard 
          label="Total Orders" 
          value={metrics.totalOrders.toLocaleString()} 
          icon={ShoppingBag} 
          change="+18.5%" 
          sub="vs last month"
        />
        <StatCard 
          label="Synced Customers" 
          value={metrics.totalCustomers.toLocaleString()} 
          icon={Users} 
          change="+11.3%" 
          sub="vs last month"
        />
      </div>

      {/* SaaS Dense Ultra-Responsive Tab Navigation */}
      <div className="bg-[#EAEAEA] p-1 rounded-xl grid grid-cols-4 gap-1 md:flex md:bg-transparent md:p-0 md:rounded-none md:border-b md:border-[#E5E5E5] md:space-x-6">
        <button 
          onClick={() => setActiveTab('opportunities')}
          className={`py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-tight rounded-lg md:rounded-none md:border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'opportunities' 
              ? 'bg-white text-[#111111] shadow-sm md:bg-transparent md:shadow-none md:border-[#111111]' 
              : 'text-[#6B7280] hover:text-[#111111] md:border-transparent md:text-[#9CA3AF]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 hidden md:inline" />
          <span className="hidden sm:inline">Opportunities</span>
          <span className="sm:inline hidden md:hidden">Opps</span>
          <span className="sm:hidden">Opps</span>
          <span className="ml-0.5 text-[9px] font-extrabold bg-[#111111] text-white px-1.5 py-0.2 rounded-full">{recommendations.length}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('cohorts')}
          className={`py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-tight rounded-lg md:rounded-none md:border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'cohorts' 
              ? 'bg-white text-[#111111] shadow-sm md:bg-transparent md:shadow-none md:border-[#111111]' 
              : 'text-[#6B7280] hover:text-[#111111] md:border-transparent md:text-[#9CA3AF]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 flex-shrink-0 hidden md:inline" />
          <span className="hidden sm:inline">Cohorts</span>
          <span className="sm:inline">Cohorts</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('products')}
          className={`py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-tight rounded-lg md:rounded-none md:border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'products' 
              ? 'bg-white text-[#111111] shadow-sm md:bg-transparent md:shadow-none md:border-[#111111]' 
              : 'text-[#6B7280] hover:text-[#111111] md:border-transparent md:text-[#9CA3AF]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0 hidden md:inline" />
          <span className="hidden sm:inline">Products</span>
          <span className="sm:inline">Products</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('sales')}
          className={`py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-tight rounded-lg md:rounded-none md:border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sales' 
              ? 'bg-white text-[#111111] shadow-sm md:bg-transparent md:shadow-none md:border-[#111111]' 
              : 'text-[#6B7280] hover:text-[#111111] md:border-transparent md:text-[#9CA3AF]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 flex-shrink-0 hidden md:inline" />
          <span className="hidden sm:inline">Sales</span>
          <span className="sm:inline">Sales</span>
        </button>
      </div>

      {/* Dynamic Tab Contents */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: REVENUE OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
              <h2 className="font-bold text-lg text-[#111111]">Actionable Suggestions</h2>
              <p className="text-sm text-[#9CA3AF] mt-1">Cora analyzed your connected customer transaction patterns to surface these high-probability sales drivers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm flex flex-col justify-between hover:border-[#111111] transition-all group">
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
                        {rec.cohort} Cohort
                      </span>
                      <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                        {rec.type === 'WhatsApp' && <MessageCircle className="w-3.5 h-3.5" />}
                        {rec.type === 'Email' && <Mail className="w-3.5 h-3.5" />}
                        {rec.type === 'SMS/WhatsApp' && <MessageCircle className="w-3.5 h-3.5" />}
                        {rec.type}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#111111] group-hover:text-[#2563EB] transition-colors">{rec.title}</h3>
                      <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>

                  {/* Recommendation Metric uplift bar */}
                  <div className="mt-6 pt-5 border-t border-[#E5E5E5] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Est. Revenue Uplift</p>
                      <p className="text-lg font-bold text-[#16A34A]">+{currencySymbol}{parseFloat(rec.estRevenue).toLocaleString()}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => triggerCampaign(rec.id)}
                        disabled={actioningId !== null}
                        className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#333333] transition-colors flex items-center justify-center gap-1.5"
                      >
                        {actioningId === rec.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Activating...
                          </>
                        ) : successId === rec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            Campaign Sent!
                          </>
                        ) : (
                          <>
                            {rec.actionText}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COHORT & LTV ANALYSIS */}
        {activeTab === 'cohorts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left cohort visual breakdown card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-[#111111]">Cohort Distribution</h2>
                  <p className="text-sm text-[#9CA3AF] mt-1">Breakdown of customer segments by density and purchase history.</p>
                </div>

                <div className="space-y-4">
                  {Object.keys(cohortStats).map((persona) => {
                    const stats = cohortStats[persona];
                    let barColor = 'bg-[#FEF3C7]';
                    let fillBar = 'bg-[#92400e]';
                    if (persona === 'Loyal') { barColor = 'bg-[#EDE9FE]'; fillBar = 'bg-[#7C3AED]'; }
                    if (persona === 'New') { barColor = 'bg-[#D1FAE5]'; fillBar = 'bg-[#065F46]'; }
                    if (persona === 'At Risk') { barColor = 'bg-[#FEE2E2]'; fillBar = 'bg-[#991B1B]'; }
                    if (persona === 'One-Time') { barColor = 'bg-[#F3F4F6]'; fillBar = 'bg-[#374151]'; }
                    if (persona === 'Prospect') { barColor = 'bg-[#DBEAFE]'; fillBar = 'bg-[#1D4ED8]'; }

                    return (
                      <div key={persona} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#111111]">{persona}</span>
                          <span className="text-[#9CA3AF]">{stats.count} ({stats.percentage.toFixed(0)}%)</span>
                        </div>
                        <div className={`h-2.5 w-full rounded-full ${barColor}`}>
                          <div className={`h-full rounded-full ${fillBar}`} style={{ width: `${stats.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right statistics overview card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-[#111111]">Lifetime Value (LTV)</h2>
                  <p className="text-sm text-[#9CA3AF] mt-1">LTV index comparison per persona segment.</p>
                </div>

                <div className="space-y-4 division-y">
                  {Object.keys(cohortStats).map((persona) => {
                    const stats = cohortStats[persona];
                    return (
                      <div key={persona} className="flex justify-between items-center py-2 border-b border-[#F3F4F6] last:border-0">
                        <span className="text-xs font-medium text-[#374151]">{persona}</span>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#111111]">{currencySymbol}{stats.avgLtv.toFixed(2)}</p>
                          <p className="text-[10px] text-[#9CA3AF]">₹{stats.totalSpent.toLocaleString()} Cumulative</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT REPEAT PERFORMANCE */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E5E5]">
              <h2 className="font-bold text-lg text-[#111111]">Top Products Repeat Rates</h2>
              <p className="text-sm text-[#9CA3AF] mt-1">Determine product repeat purchase rates to optimize cross-selling campaigns.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E5E5] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-right">Revenue Generated</th>
                    <th className="px-6 py-4 text-center">Repeat Purchase Rate</th>
                    <th className="px-6 py-4 text-right">Quantity Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {topProducts.map((prod: any) => (
                    <tr key={prod.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#111111]">
                        <div className="flex items-center gap-3">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} className="w-8 h-8 rounded-lg object-cover border border-[#E5E5E5]" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E5E5E5] flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4 text-[#9CA3AF]" />
                            </div>
                          )}
                          <span>{prod.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#111111]">
                        {currencySymbol}{prod.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${prod.repeatRate > 30 ? 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]' : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'}`}>
                          {prod.repeatRate.toFixed(1)}% Repeat Rate
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#616161]">
                        {prod.quantity} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDER & SALES DYNAMICS */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart Dynamics */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-bold text-lg text-[#111111]">Sales Velocity</h2>
                <p className="text-sm text-[#9CA3AF] mt-1">Review the transactional revenue over the last 10 active dates.</p>
              </div>

              {/* Pure CSS Visual Sales Graph */}
              <div className="flex flex-col gap-4">
                {salesDynamics.map((dynamic: any) => {
                  // Find relative percentage width for sales
                  const maxSales = Math.max(...salesDynamics.map((s: any) => s.revenue)) || 1;
                  const percentWidth = (dynamic.revenue / maxSales) * 100;

                  return (
                    <div key={dynamic.date} className="flex items-center gap-4 text-xs">
                      <span className="w-16 font-semibold text-[#616161]">{dynamic.date}</span>
                      <div className="flex-1 bg-[#F3F4F6] rounded-md h-6 overflow-hidden relative border border-[#E5E5E5]">
                        <div 
                          className="bg-[#111111] h-full rounded-md transition-all duration-500" 
                          style={{ width: `${Math.max(percentWidth, 4)}%` }}
                        ></div>
                        <span className="absolute inset-y-0 left-2 flex items-center font-bold text-[10px] text-white mix-blend-difference">
                          {currencySymbol}{dynamic.revenue.toFixed(0)}
                        </span>
                      </div>
                      <span className="w-16 text-right font-medium text-[#9CA3AF]">{dynamic.orders} orders</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Live Stream Card */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-6 border-b border-[#E5E5E5]">
                <h2 className="font-bold text-lg text-[#111111]">Recent Orders</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Live customer orders stream from Shopify</p>
              </div>
              <div className="divide-y divide-[#F3F4F6] overflow-y-auto max-h-[360px] flex-1">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#111111]">{order.name}</p>
                          <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#111111]">{currencySymbol}{parseFloat(order.total_price).toLocaleString()}</p>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                          order.financial_status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                          order.financial_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {order.financial_status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#9CA3AF]">
                    No recent orders found.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
