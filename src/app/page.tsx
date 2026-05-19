import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, BarChart3, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans text-[#111111]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#F7F7F7]/80 backdrop-blur-md z-50 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 mr-2" />
            Cora
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-sm font-medium hover:text-[#616161] transition-colors">
              Sign In
            </Link>
            <Link 
              href="/onboarding" 
              className="bg-[#111111] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#333333] transition-colors shadow-sm"
            >
              Get Beta Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-sm font-medium text-[#111111] shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] mr-2 animate-pulse"></span>
            Private Beta Now Open
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#111111] leading-tight">
            Understand your <br className="hidden md:block" />
            <span className="text-[#616161]">eCommerce customers</span> instantly.
          </h1>
          <p className="text-lg md:text-xl text-[#616161] max-w-2xl mx-auto leading-relaxed">
            Connect your Shopify or WooCommerce store in 1-click. Cora analyzes your purchase history to automatically generate AI user personas and targeted marketing campaigns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/onboarding" 
              className="w-full sm:w-auto flex items-center justify-center bg-[#111111] text-white px-8 py-3.5 rounded-xl font-medium text-lg hover:bg-[#333333] transition-all shadow-sm"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center bg-white text-[#111111] border border-[#E5E5E5] px-8 py-3.5 rounded-xl font-medium text-lg hover:bg-[#F9FAFB] transition-all shadow-sm"
            >
              View Demo
            </Link>
          </div>
          <p className="text-sm text-[#8a8a8a] mt-4">No credit card required. 14-day free trial.</p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center mb-6 border border-[#DCFCE7]">
              <Users className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Personas</h3>
            <p className="text-[#616161] leading-relaxed">Instantly categorize your customers by price sensitivity, category affinity, and engagement levels without writing a single rule.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-6 border border-[#DBEAFE]">
              <Zap className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Campaigns</h3>
            <p className="text-[#616161] leading-relaxed">Trigger hyper-personalized WhatsApp and Web Push campaigns exactly when a customer is ready to buy.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <div className="w-12 h-12 bg-[#FAF5FF] rounded-xl flex items-center justify-center mb-6 border border-[#F3E8FF]">
              <BarChart3 className="w-6 h-6 text-[#9333EA]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Predictive Insights</h3>
            <p className="text-[#616161] leading-relaxed">Stop guessing what sells. Let Cora predict which products to pitch to which cohorts to maximize LTV.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center font-bold text-xl tracking-tight mb-4 md:mb-0">
            <Sparkles className="w-5 h-5 mr-2" />
            Cora
          </div>
          <div className="text-sm text-[#616161]">
            © {new Date().getFullYear()} Cora Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
