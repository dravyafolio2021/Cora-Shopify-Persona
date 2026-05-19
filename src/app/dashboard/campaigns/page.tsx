"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Layers,
  Bell,
  Clock,
  Sparkle,
  BookOpen,
  UserPlus
} from 'lucide-react';

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'simulator'>('campaigns');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [simStep, setSimStep] = useState<'lockscreen' | 'webapp' | 'success'>('lockscreen');
  const [userChoice, setUserChoice] = useState<'yes' | 'no' | null>(null);

  // 1. Fetch campaigns groups
  const { data: campaignData, isLoading: isCampaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await axios.get('/api/store/campaigns');
      return res.data;
    }
  });

  // 2. Fetch individual notification jobs for simulator
  const { data: jobsData, isLoading: isJobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['campaigns-jobs'],
    queryFn: async () => {
      const res = await axios.get('/api/store/campaigns/jobs');
      return res.data;
    }
  });

  // 3. Pause mutation
  const pauseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      await axios.patch(`/api/store/campaigns/${purchaseId}/pause`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  // 4. Resume mutation
  const resumeMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      await axios.patch(`/api/store/campaigns/${purchaseId}/resume`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  // 5. Generate Test Campaign Mutation
  const generateTestMutation = useMutation({
    mutationFn: async () => {
      const products = [
        'Turmeric Glow Facial Serum', 
        'Lavender Pure Essential Oil', 
        'Organic Bulgarian Rosewater Mist',
        'Activated Charcoal Clarifying Soap',
        'Sandalwood & Saffron Face Scrub'
      ];
      const names = [
        { first: 'Kiara', last: 'Patel' },
        { first: 'Aria', last: 'Sharma' },
        { first: 'Kabir', last: 'Mehta' },
        { first: 'Rhea', last: 'Suri' },
        { first: 'Dev', last: 'Kapoor' }
      ];
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];

      const res = await axios.post('/api/store/campaigns/create-test', {
        firstName: randomName.first,
        lastName: randomName.last,
        productName: randomProduct
      });
      return res.data;
    },
    onSuccess: () => {
      refetchCampaigns();
      refetchJobs();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  // 6. Simulate web push click & reaction mutation
  const simulateMutation = useMutation({
    mutationFn: async ({ jobId, response }: { jobId: string, response: string }) => {
      const res = await axios.post('/api/store/campaigns/simulate', { jobId, response });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      refetchJobs();
      setSimStep('success');
    }
  });

  const selectJobForSimulator = (job: any) => {
    setSelectedJob(job);
    setSimStep('lockscreen');
    setUserChoice(null);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Outreach Campaigns</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Track, schedule, and test AI-driven skincare routine check-ins and Web Push notifications.
          </p>
        </div>

        {/* Action Buttons & Tab Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={generateTestMutation.isPending}
            onClick={() => generateTestMutation.mutate()}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {generateTestMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> ✨ Create Demo Campaign
              </>
            )}
          </button>

          <div className="bg-[#F3F4F6] p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'campaigns' 
                  ? 'bg-white text-[#111111] shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              Active Campaigns
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator' 
                  ? 'bg-white text-[#111111] shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Web Push Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CAMPAIGNS MONITORING */}
      {activeTab === 'campaigns' && (
        <>
          {/* STATS OVERVIEW */}
          {isCampaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E5E5] h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            campaignData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Active Campaigns</p>
                    <h3 className="text-3xl font-bold text-[#111111] mt-1">
                      {campaignData.stats?.active_campaigns || 0}
                    </h3>
                    <p className="text-xs text-[#10B981] font-semibold mt-1">Processing live webhooks</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <Play className="w-6 h-6" />
                  </div>
                </div>

                {/* Paused */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Paused Routines</p>
                    <h3 className="text-3xl font-bold text-[#111111] mt-1">
                      {campaignData.stats?.paused_campaigns || 0}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1">Temporarily stopped</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Pause className="w-6 h-6" />
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Responses (Month)</p>
                    <h3 className="text-3xl font-bold text-[#111111] mt-1">
                      {campaignData.stats?.completed_this_month || 0}
                    </h3>
                    <p className="text-xs text-[#2563EB] font-semibold mt-1">Profile data enriched</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

              </div>
            )
          )}

          {/* ACTIVE CAMPAIGNS LIST */}
          {isCampaignsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E5E5] h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            campaignData && (
              <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Treatment Product</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Channel</th>
                      <th className="px-6 py-4 hidden md:table-cell">Start Date</th>
                      <th className="px-6 py-4">Schedule Progress</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {campaignData.campaigns.map((camp: any) => {
                      const total = parseInt(camp.total_jobs, 10) || 1;
                      const completed = parseInt(camp.completed_jobs, 10) || 0;
                      const paused = parseInt(camp.paused_jobs, 10) || 0;
                      const percentage = Math.round((completed / total) * 100);
                      const isCampaignPaused = paused > 0;

                      return (
                        <tr key={camp.purchase_id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-6 py-4 font-semibold text-[#111111]">
                            {camp.first_name} {camp.last_name}
                          </td>
                          <td className="px-6 py-4 text-[#374151] font-medium">
                            {camp.product_title}
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Bell className="w-3 h-3" /> Web Push
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#6B7280] hidden md:table-cell">
                            {new Date(camp.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 max-w-[120px] bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${isCampaignPaused ? 'bg-amber-400' : 'bg-[#111111]'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="font-bold text-[#111111]">
                                {completed}/{total} ({percentage}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  // Open in simulator and switch tab
                                  const matchingJob = jobsData?.jobs?.find((j: any) => j.purchase_id === camp.purchase_id && j.status === 'pending');
                                  if (matchingJob) {
                                    selectJobForSimulator(matchingJob);
                                  } else {
                                    // Fallback to first job of this customer
                                    const anyJob = jobsData?.jobs?.find((j: any) => j.purchase_id === camp.purchase_id);
                                    if (anyJob) selectJobForSimulator(anyJob);
                                  }
                                  setActiveTab('simulator');
                                }}
                                className="px-3 py-1.5 bg-[#111111] text-white rounded-lg font-bold hover:bg-[#333333] transition-colors"
                              >
                                Test Push Notification
                              </button>
                              {isCampaignPaused ? (
                                <button
                                  disabled={resumeMutation.isPending}
                                  onClick={() => resumeMutation.mutate(camp.purchase_id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold hover:bg-green-100 transition-colors"
                                >
                                  <Play className="w-3 h-3" /> Resume
                                </button>
                              ) : (
                                <button
                                  disabled={pauseMutation.isPending}
                                  onClick={() => pauseMutation.mutate(camp.purchase_id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold hover:bg-amber-100 transition-colors"
                                >
                                  <Pause className="w-3 h-3" /> Pause
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {campaignData.campaigns.length === 0 && (
                  <div className="p-16 text-center text-[#9CA3AF]">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold text-[#111111]">No active campaigns found</p>
                    <p className="text-xs text-[#9CA3AF] mt-1 max-w-md mx-auto">
                      Skincare campaigns generate automatically when shopify purchases occur. Tap the button below to generate a live mock campaign!
                    </p>
                    <button
                      onClick={() => generateTestMutation.mutate()}
                      className="mt-4 px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-lg hover:bg-black"
                    >
                      ✨ Generate Demo Skincare Campaign
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* TAB 2: INTERACTIVE WEB PUSH SANDBOX SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: JOBS QUEUE SELECTOR */}
          <div className="lg:col-span-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="p-6 border-b border-[#F3F4F6]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">Outreach Web Push Queue</h3>
                <button
                  onClick={() => generateTestMutation.mutate()}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  + Add Test
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Select a scheduled notification check-in job below to simulate how it renders and enriches data from a customer's phone!
              </p>
            </div>

            {isJobsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-[#111111] animate-spin mx-auto" />
                <p className="text-xs text-[#9CA3AF] mt-2">Loading outreach queues...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6] flex-1 overflow-y-auto max-h-[400px]">
                {jobsData?.jobs?.map((job: any) => {
                  const isSelected = selectedJob?.id === job.id;
                  
                  return (
                    <div 
                      key={job.id}
                      onClick={() => selectJobForSimulator(job)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/50 border-l-4 border-purple-600' : 'hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#111111]">
                            {job.first_name} {job.last_name}
                          </p>
                          <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                            job.status === 'sent' ? 'bg-green-50 text-green-700 border border-green-200' :
                            job.status === 'paused' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">
                          {job.product_title} • Day {job.day_number} check-in
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
                    </div>
                  );
                })}

                {(!jobsData?.jobs || jobsData.jobs.length === 0) && (
                  <div className="p-12 text-center text-[#9CA3AF] space-y-4">
                    <div>
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-bold text-[#111111]">No scheduled outreach jobs found.</p>
                      <p className="text-[10px] text-[#D1D5DB] mt-1">Generate a demo customer campaign instantly to activate the sandbox!</p>
                    </div>
                    <button
                      onClick={() => generateTestMutation.mutate()}
                      className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
                    >
                      ✨ Generate Demo Skincare Campaign
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex justify-between items-center text-xs text-[#9CA3AF]">
              <span>Active mobile push integration sandbox</span>
              <button 
                onClick={() => refetchJobs()}
                className="text-[#111111] font-bold hover:underline"
              >
                Sync Queue
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: IPHONE MOBILE DEVICE LOCKSCREEN & WEB APP */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[360px] h-[640px] bg-[#1e1e1e] rounded-[40px] p-3 shadow-2xl border-4 border-[#333] relative flex flex-col overflow-hidden select-none">
              
              {/* iPhone top notch area */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20 flex items-center justify-between px-4">
                <span className="w-1.5 h-1.5 bg-[#222] rounded-full"></span>
                <span className="w-8 h-1 bg-[#222] rounded-full"></span>
              </div>

              {/* SIMULATION SCREENS */}
              {selectedJob ? (
                <div className="flex-1 rounded-[28px] overflow-hidden flex flex-col relative pt-6 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=360&auto=format&fit=crop')" }}>
                  
                  {/* STEP 1: MOBILE LOCKSCREEN WITH WEB PUSH NOTIFICATION */}
                  {simStep === 'lockscreen' && (
                    <div className="flex-1 bg-black/30 backdrop-blur-[2px] p-4 flex flex-col justify-between text-white relative">
                      
                      {/* Top Time and Date */}
                      <div className="text-center mt-8 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-85">
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h2 className="text-5xl font-light tracking-tight">09:41</h2>
                      </div>

                      {/* Web Push Notification Card */}
                      <div 
                        onClick={() => setSimStep('webapp')}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg animate-bounce flex items-start gap-3 cursor-pointer hover:bg-white/15 transition-all select-none"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                          <Sparkle className="w-5 h-5 fill-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wide uppercase text-purple-300">Cora Skincare</span>
                            <span className="text-[8px] text-white/60">now</span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                            Day {selectedJob.day_number}: Did you use your {selectedJob.product_title}?
                          </h4>
                          <p className="text-[10px] text-white/80 mt-0.5 leading-relaxed">
                            Tap to log your skincare routine consistency and update your streak.
                          </p>
                        </div>
                      </div>

                      {/* Bottom Unlock bar */}
                      <div className="text-center pb-2 opacity-60 flex flex-col items-center gap-1.5">
                        <div className="w-24 h-1 bg-white rounded-full"></div>
                        <span className="text-[8px] font-bold uppercase tracking-widest">Tap notification to open check-in</span>
                      </div>

                    </div>
                  )}

                  {/* STEP 2: SKINCARE PORTAL CHECK-IN WEB APP */}
                  {simStep === 'webapp' && (
                    <div className="flex-1 bg-gradient-to-br from-[#FEF2F2] via-white to-[#F5F3FF] p-6 flex flex-col justify-between relative text-left">
                      
                      {/* Web App top header */}
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                            <Sparkle className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <span className="text-xs font-bold text-[#111111] tracking-tight">Cora Skin Portal</span>
                        </div>
                        <span className="text-[8px] font-bold bg-[#E5E5E5] px-2 py-0.5 rounded-full text-[#6B7280]">
                          Secure Portal
                        </span>
                      </div>

                      {/* Skincare product interaction */}
                      <div className="flex-1 flex flex-col items-center justify-center my-6 space-y-5 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-inner animate-pulse">
                          <Smartphone className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-[#111111]">Daily Routine Log</h3>
                          <p className="text-xs text-[#9CA3AF] px-4 leading-relaxed">
                            Hi <span className="font-bold text-[#111111]">{selectedJob.first_name || 'there'}</span>! Day {selectedJob.day_number} of consistency is here. Did you apply your treatment today?
                          </p>
                        </div>

                        <div className="bg-white/80 border border-[#E5E5E5] rounded-2xl p-4 w-full text-xs font-bold text-[#374151] flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-purple-500" />
                          <span className="truncate">{selectedJob.product_title}</span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="space-y-2">
                        {simulateMutation.isPending ? (
                          <button
                            disabled
                            className="w-full py-3 bg-[#111111] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Loader2 className="w-4 h-4 animate-spin" /> Loggin routine...
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setUserChoice('yes');
                                simulateMutation.mutate({ jobId: selectedJob.id, response: 'yes' });
                              }}
                              className="w-full py-3 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-[#333333] transition-all shadow-sm active:scale-[0.98]"
                            >
                              ✅ Yes, I applied it!
                            </button>
                            <button
                              onClick={() => {
                                setUserChoice('no');
                                simulateMutation.mutate({ jobId: selectedJob.id, response: 'no' });
                              }}
                              className="w-full py-3 bg-white border border-[#E5E5E5] text-[#374151] rounded-xl text-xs font-bold hover:bg-[#FAFAFA] transition-all active:scale-[0.98]"
                            >
                              ❌ Not yet
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  )}

                  {/* STEP 3: SUCCESS & STREAK PAGE */}
                  {simStep === 'success' && (
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between relative text-left">
                      
                      {/* Web App top header */}
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                            <Sparkle className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <span className="text-xs font-bold text-[#111111] tracking-tight">Cora Skin Portal</span>
                        </div>
                        <span className="text-[8px] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-full text-[#10B981]">
                          Verified
                        </span>
                      </div>

                      {/* Success and dynamic tips */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100 shadow-inner">
                          <CheckCircle className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-[#111111]">Streak Recorded!</h3>
                          <p className="text-xs text-[#9CA3AF] px-4 leading-relaxed">
                            {userChoice === 'yes' ? (
                              <>
                                Excellent work, <span className="font-bold text-[#111111]">{selectedJob.first_name || 'there'}</span>! Your Day {selectedJob.day_number} consistency log has successfully been registered in your profile.
                              </>
                            ) : (
                              <>
                                Thank you for your feedback, <span className="font-bold text-[#111111]">{selectedJob.first_name || 'there'}</span>! Skincare is a journey. Keep up consistency tonight before sleep!
                              </>
                            )}
                          </p>
                        </div>

                        {/* Motivational Box */}
                        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl w-full text-xs text-[#6B7280] leading-relaxed">
                          <p className="font-bold text-purple-700 mb-1 flex items-center justify-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Skincare Tip of the Day
                          </p>
                          Consistency is the absolute secret to glowing skin. 90% of routine efficacy relies on consistent daily application!
                        </div>
                      </div>

                      {/* Close simulator screen */}
                      <button
                        onClick={() => setSimStep('lockscreen')}
                        className="w-full py-3 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-[#333333] transition-all"
                      >
                        Reset Simulator
                      </button>

                    </div>
                  )}

                </div>
              ) : (
                <div className="flex-1 bg-[#252525] rounded-[28px] overflow-hidden flex flex-col items-center justify-center text-center p-6 text-white relative pt-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-purple-400 mb-4 border border-white/10 shadow-lg">
                    <Bell className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold">Web Push Sandbox</h4>
                  <p className="text-xs text-white/50 px-6 mt-2 leading-relaxed">
                    Select a scheduled daily check-in job from the queue on the left to activate the mobile lockscreen simulator!
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
