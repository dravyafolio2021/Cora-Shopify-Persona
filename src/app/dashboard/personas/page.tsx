"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Sparkles, 
  Users,  
  TrendingUp, 
  ArrowRight, 
  Loader2, 
  Tag, 
  DollarSign, 
  Layers
} from 'lucide-react';
import { PERSONA_META, PERSONA_ICONS } from '@/lib/personas';

export default function PersonasPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const res = await axios.get('/api/store/personas');
      return res.data;
    }
  });

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* 1. PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Skin Personas</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Real-time AI-segmented cohorts computed from your connected Shopify store's historical metrics.
          </p>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E5E5] h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Cohorts */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Active Cohorts</p>
                <h3 className="text-3xl font-bold text-[#111111] mt-1">{data.personas?.length || 0}</h3>
                <p className="text-xs text-[#10B981] font-semibold mt-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Segmented Catalog
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Total Customers */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Total Classified</p>
                <h3 className="text-3xl font-bold text-[#111111] mt-1">{data.total || 0}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">Classified Shopify clients</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Top Cohort by Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Top LTV Segment</p>
                <h3 className="text-xl font-bold text-[#111111] mt-2 truncate max-w-[200px]">
                  {data.personas?.[0]?.name || 'No Segment'}
                </h3>
                <p className="text-xs text-[#10B981] font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> High Lifetime Value
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

          </div>
        )
      )}

      {/* 3. PERSONAS LIST GRID */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E5E5] h-96 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
          Failed to load segmented personas. Connect your Shopify keys under Settings first to index the active segments.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.personas.map((persona: any) => {
            const Icon = PERSONA_ICONS[persona.name];
            const meta = PERSONA_META[persona.name] || {};

            return (
              <div 
                key={persona.name}
                className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Cohort Header */}
                <div className="p-6 border-b border-[#F3F4F6] bg-[#FAFAFA] flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{ 
                        backgroundColor: meta.bg || '#F3F4F6', 
                        borderColor: meta.borderColor || '#E5E5E5',
                        color: meta.color || '#111111' 
                      }}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111111]">{persona.name}</h3>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{meta.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-[#111111] text-white px-2.5 py-1 rounded-lg">
                    {persona.count} {persona.count === 1 ? 'member' : 'members'}
                  </span>
                </div>

                {/* Cohort Metrics */}
                <div className="p-6 grid grid-cols-2 gap-4 border-b border-[#F3F4F6] text-center bg-white">
                  <div>
                    <p className="text-xs text-[#9CA3AF] font-medium flex items-center justify-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Total Revenue
                    </p>
                    <p className="text-lg font-bold text-[#111111] mt-1">
                      ₹{parseFloat(persona.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] font-medium flex items-center justify-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Average LTV
                    </p>
                    <p className="text-lg font-bold text-[#111111] mt-1">
                      ₹{parseFloat(persona.avgRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Cohort Top Members Preview */}
                <div className="p-6 flex-1 space-y-4 bg-white">
                  <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Top Cohort Members</p>
                  <div className="space-y-3">
                    {persona.members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
                            <span className="text-[#9CA3AF] text-[10px] font-bold">
                              {`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-[#374151]">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                        <span className="font-bold text-[#111111]">
                          ₹{parseFloat(member.total_spent || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Campaign Trigger */}
                <div className="p-6 border-t border-[#F3F4F6] bg-[#FAFAFA] flex justify-end">
                  <button 
                    onClick={() => window.location.href = '/dashboard/campaigns'}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:text-[#555] transition-colors"
                  >
                    Manage Target Campaign <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
