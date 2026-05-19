"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShoppingBag, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingStore() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data && data.store) {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Onboarding skip check failed:', err);
      }
    }
    checkExistingStore();
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'oauth_failed') {
        setErrorMsg('Shopify connection failed. Please check your store URL and try again.');
        setStep(2);
      }
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setStep(4);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUrl) return;

    setLoading(true);
    // Sanitize the Shopify store URL
    const domain = storeUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    // Redirect to real Shopify OAuth flow
    window.location.href = `/api/shopify/oauth?shop=${encodeURIComponent(domain)}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 text-[#111111] font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden relative">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 h-1 bg-[#111111] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="w-6 h-6 mr-2 text-[#111111]" />
            <span className="font-bold text-xl tracking-tight">Cora</span>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Connect your store</h1>
                <p className="text-sm text-[#616161]">Select your eCommerce platform to start generating user personas automatically.</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F9FAFB] transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mr-3">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Shopify</p>
                      <p className="text-xs text-[#616161]">1-click connection</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#111111] transition-colors" />
                </button>
                
                <button 
                  disabled
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E5E5E5] opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] text-[#616161] flex items-center justify-center mr-3">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">WooCommerce</p>
                      <p className="text-xs text-[#616161]">Coming soon</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Enter Store URL</h1>
                <p className="text-sm text-[#616161]">We need your Shopify store URL to authenticate.</p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Shopify URL</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="mystore.myshopify.com"
                      className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:ring-1 focus:ring-[#111111] focus:border-[#111111] transition-all outline-none text-[#111111] text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-[#111111] font-medium bg-white hover:bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl transition-colors text-sm w-1/3"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !storeUrl}
                    className="flex-1 py-2.5 bg-[#111111] text-white font-medium rounded-xl hover:bg-[#333333] transition-colors disabled:opacity-50 text-sm flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect Store'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4 text-center">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="46" className="text-[#F7F7F7]" strokeWidth="4" fill="none" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="46" 
                    className="text-[#111111] transition-all duration-200" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray="289" 
                    strokeDashoffset={289 - (289 * progress) / 100} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{progress}%</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-xl font-bold tracking-tight mb-2">Analyzing Store Data</h1>
                <p className="text-sm text-[#616161]">Crunching numbers and generating AI personas...</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-2">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">You're all set!</h1>
                <p className="text-sm text-[#616161]">We've successfully synced your store data and generated your initial personas.</p>
              </div>
              <Link 
                href="/dashboard"
                className="w-full py-3 bg-[#111111] text-white font-medium rounded-xl hover:bg-[#333333] transition-colors text-sm flex items-center justify-center mt-8"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}

        </div>
      </div>
      
      {step === 1 && (
        <div className="mt-8 text-center">
          <p className="text-xs text-[#616161]">Want to explore first?</p>
          <Link href="/dashboard" className="text-sm font-medium text-[#111111] hover:underline mt-1 inline-block">
            View Demo Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
