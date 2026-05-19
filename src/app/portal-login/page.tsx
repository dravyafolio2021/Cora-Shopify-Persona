"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Bell, Sparkles, Loader2, Key, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function PortalLoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://cora-persona-backend.vercel.app/api/auth/customer-login', {
        emailOrPhone,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        const customer = response.data.customer;
        
        // Save customer details to localStorage for storefront sync state persistence
        localStorage.setItem('cora_customer_id', customer.shopify_customer_id);
        localStorage.setItem('cora_customer_name', `${customer.first_name} ${customer.last_name}`);
        
        // Dispatch postMessage event to parent Shopify storefront context
        if (typeof window !== 'undefined' && window.parent) {
          window.parent.postMessage({
            type: 'cora-login-success',
            customerId: customer.shopify_customer_id,
            customerName: `${customer.first_name} ${customer.last_name}`
          }, '*');
        }

        // Smoothly redirect them to their device registry dashboard!
        setTimeout(() => {
          router.push(`/register-device?customerId=${customer.shopify_customer_id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your email/phone and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans select-none selection:bg-purple-500/30">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-950/35 blur-[120px] pointer-events-none" />

      {/* Floating Sparkle Micro-decorations */}
      <div className="absolute top-1/4 right-1/4 text-purple-500/20 animate-pulse pointer-events-none"><Sparkles className="w-8 h-8" /></div>
      <div className="absolute bottom-1/3 left-1/5 text-purple-400/15 animate-bounce pointer-events-none" style={{ animationDuration: '6s' }}><Sparkles className="w-5 h-5" /></div>

      {/* Header / Brand */}
      <header className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="text-white font-extrabold text-sm tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CORA SKIN PORTAL</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-purple-300">
          <ShieldCheck className="w-3 h-3" /> NATIVE STORE SECURE
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[440px] bg-slate-900/40 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative">
          
          {/* Card Border Active Glow */}
          <div className="absolute inset-0 rounded-3xl border border-purple-500/20 pointer-events-none mask-image-gradient" />

          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Sync Skincare Journey</h1>
            <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
              Log in with your Shopify details to access your custom routines, view streaks, and manage push notifications.
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs leading-relaxed text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs text-center flex flex-col items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>Authentication Successful! Loading Sync Console...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input 1: Email or Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Shopify Email or Phone</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="e.g. shravya@cora.com"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  disabled={loading || success}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950/80 border border-white/[0.08] text-white text-sm placeholder-slate-600 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <span className="text-[9px] font-bold text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950/80 border border-white/[0.08] text-white text-sm placeholder-slate-700 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Authenticate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Presentation Helper */}
          <div className="mt-8 text-center pt-6 border-t border-white/[0.05]">
            <p className="text-[10px] font-semibold text-slate-500">
              💡 Presentation Tip: Log in using any synced Shopify email to view their customized live streak instantly!
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-[10px] text-slate-600 z-10 flex items-center justify-center gap-1">
        <span>Bhutri Essentials Skincare Segment Engine</span>
        <Heart className="w-3 h-3 text-purple-500 fill-purple-500 animate-pulse" />
        <span>Cora Persona Portal</span>
      </footer>

    </div>
  );
}
