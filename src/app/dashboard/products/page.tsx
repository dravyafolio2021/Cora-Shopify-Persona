"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, ShoppingBag, Package, AlertTriangle, CheckCircle, Tag, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [showInstructions, setShowInstructions] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: async () => {
      const res = await axios.get('/api/store/products');
      return res.data;
    }
  });

  const productsList = data?.products || [];
  const filteredProducts = productsList.filter((p: any) => 
    p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    (p.product_type && p.product_type.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  // Compute product stats
  const totalProducts = productsList.length;
  const lowStockCount = productsList.filter((p: any) => 
    p.variants?.some((v: any) => v.inventory_quantity > 0 && v.inventory_quantity < 5)
  ).length;
  const outOfStockCount = productsList.filter((p: any) => 
    p.variants?.every((v: any) => v.inventory_quantity === 0)
  ).length;
  const activeCount = productsList.filter((p: any) => p.status === 'active' || !p.status).length;

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Products</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Manage and audit your connected Shopify store's catalog.</p>
        </div>
        <div>
          <button 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#111111] hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Syncing...' : 'Sync Products'}
          </button>
        </div>
      </div>

      {/* ⚠️ HIGH-FIDELITY ACTIVE FALLBACK NOTIFICATION ACTION BOX */}
      {!isLoading && data?.isFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">⚠️ Active Fallback Mode: Enable "read_products" Scope in Shopify Admin</h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                This dashboard is currently serving high-fidelity cosmetic catalog mockups because your connected Custom App API key does not have the **read_products** permission enabled in Shopify.
              </p>
            </div>
          </div>

          <div className="border-t border-amber-200/60 pt-3">
            <button 
              onClick={() => setShowInstructions(prev => !prev)}
              className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1.5"
            >
              {showInstructions ? 'Hide Setup Guide' : '👉 Click here for the 60-Second Setup Guide to sync your REAL products'}
            </button>

            {showInstructions && (
              <div className="mt-3 bg-white/70 border border-amber-200/50 rounded-xl p-4 space-y-3.5 text-xs text-amber-900 leading-relaxed shadow-inner animate-fadeIn">
                <p className="font-semibold text-[#111111]">Follow these simple steps in your Shopify Store Admin:</p>
                <ol className="list-decimal list-inside space-y-2 text-[#444444] font-medium">
                  <li>Log in to your <strong className="text-[#111111]">Shopify Store Admin Panel</strong>.</li>
                  <li>Navigate to <strong className="text-[#111111]">Settings</strong> (bottom-left gear icon) &rarr; <strong className="text-[#111111]">Apps and sales channels</strong> &rarr; <strong className="text-[#111111]">Develop apps</strong>.</li>
                  <li>Click on the custom developer app you created for Cora Persona.</li>
                  <li>Open the <strong className="text-[#111111]">Configuration</strong> tab.</li>
                  <li>Next to <strong className="text-[#111111]">Admin API integration</strong>, click <strong className="text-[#111111]">Edit</strong>.</li>
                  <li>Search for and check the following critical scopes to sync all workspace metrics:
                    <ul className="list-disc list-inside pl-4 mt-1.5 space-y-1 text-amber-950 font-bold">
                      <li>read_products (Live product catalog sync)</li>
                      <li>read_customers (Lifecycle and cohorts sync)</li>
                      <li>read_orders (Recent transactions & revenue sync)</li>
                      <li>read_inventory (Stock levels & variants sync)</li>
                    </ul>
                  </li>
                  <li>Scroll back to the top of the page and click <strong className="text-[#111111]">Save</strong>.</li>
                </ol>
                <div className="bg-amber-100/60 border border-amber-200 rounded-lg p-3 text-[11px] font-semibold text-amber-950">
                  ✨ Once saved, return to this page and click the <strong>"Sync Products"</strong> button at the top-right! Your real products will load instantly.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-2xl font-bold text-[#111111]">{isLoading ? '...' : totalProducts}</p>
          </div>
          <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-[#111111]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Active Catalog</p>
            <p className="text-2xl font-bold text-[#16A34A]">{isLoading ? '...' : activeCount}</p>
          </div>
          <div className="w-9 h-9 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Low Stock Warning</p>
            <p className="text-2xl font-bold text-[#D97706]">{isLoading ? '...' : lowStockCount}</p>
          </div>
          <div className="w-9 h-9 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-[#DC2626]">{isLoading ? '...' : outOfStockCount}</p>
          </div>
          <div className="w-9 h-9 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input 
          type="text" 
          placeholder="Search product catalog by name or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-shadow shadow-sm"
        />
      </div>

      {/* Loading state animation */}
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
          Failed to fetch Shopify catalog products. Make sure your custom app is configured correctly.
        </div>
      )}

      {/* Products table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-right">Base Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider text-center">Inventory Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden sm:table-cell">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {filteredProducts.map((prod: any) => {
                const basePrice = prod.variants?.[0]?.price || '0.00';
                const totalStock = prod.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0;
                const isOutOfStock = totalStock === 0;
                const isLowStock = totalStock > 0 && totalStock < 5;
                const coverImage = prod.image?.src || (prod.images && prod.images[0]?.src) || null;

                return (
                  <tr key={prod.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    {/* Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {coverImage ? (
                          <img src={coverImage} alt={prod.title} className="w-9 h-9 rounded-lg object-cover border border-[#E5E5E5] flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-4 h-4 text-[#9CA3AF]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#111111] group-hover:text-[#2563EB] transition-colors">
                            {prod.title}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{prod.variants?.length || 1} variant(s)</p>
                        </div>
                      </div>
                    </td>

                    {/* Category Type */}
                    <td className="px-6 py-4 hidden md:table-cell text-[#374151] font-medium">
                      {prod.product_type || 'Uncategorized'}
                    </td>

                    {/* Base price */}
                    <td className="px-6 py-4 text-right font-bold text-[#111111]">
                      ₹{parseFloat(basePrice).toLocaleString()}
                    </td>

                    {/* Inventory */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' :
                        isLowStock ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOutOfStock ? 'bg-red-600' :
                          isLowStock ? 'bg-yellow-500' :
                          'bg-green-600'
                        }`}></span>
                        {isOutOfStock ? 'Out of Stock' :
                         isLowStock ? `${totalStock} units (Low Stock)` :
                         `${totalStock} units available`}
                      </span>
                    </td>

                    {/* Vendor */}
                    <td className="px-6 py-4 hidden sm:table-cell text-[#6B7280]">
                      {prod.vendor || 'Generic'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-[#9CA3AF]">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No products found in the connected catalog.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
