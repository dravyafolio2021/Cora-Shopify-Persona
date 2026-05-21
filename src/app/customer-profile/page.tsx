"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Bell, 
  CheckCircle2, 
  Shield, 
  AlertTriangle, 
  Sparkles, 
  Loader2, 
  Flame, 
  User, 
  ShoppingBag, 
  TrendingUp, 
  LogOut, 
  Laptop, 
  Smartphone, 
  XCircle, 
  Info,
  Calendar,
  Sparkle,
  Clock
} from 'lucide-react';

function CustomerProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get('customerId');
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Device sync details
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
  const [deviceEndpoint, setDeviceEndpoint] = useState<string | null>(null);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  // Sync profile details
  const [streak, setStreak] = useState(0);
  const [persona, setPersona] = useState('Skincare Enthusiast');
  const [skinType, setSkinType] = useState('Dry');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [preferredTime, setPreferredTime] = useState<string>('09:00');
  const [updatingTime, setUpdatingTime] = useState(false);
  
  // Purchases & habit logging check-in history
  const [purchases, setPurchases] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      setIsIframe(window.self !== window.top);
    }
  }, []);

  useEffect(() => {
    if (!customerId) {
      setError('Missing customer profile ID');
      setLoading(false);
      return;
    }

    const checkLocalSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              return sub.endpoint;
            }
          }
        } catch (e) {
          console.warn('Error checking local push subscription:', e);
        }
      }
      return null;
    };

    // Hydrate everything simultaneously
    Promise.all([
      axios.get(`/api/store/customers/${customerId}`),
      axios.get(`https://cora-persona-backend.vercel.app/api/public/customer/${customerId}`),
      checkLocalSubscription()
    ])
      .then(([custRes, backendRes, endpoint]) => {
        const custData = custRes.data.customer;
        const infoData = backendRes.data;

        setCustomer(custData);
        setStreak(infoData.streak || 0);
        setPersona(infoData.persona || 'Skincare Enthusiast');
        setSkinType(infoData.skin_type || 'Dry');
        setPreferredTime(infoData.preferred_notification_time || '09:00');
        setConcerns(infoData.concerns || []);
        setRecommendations(infoData.recommendations || []);
        setPurchases(infoData.purchases || []);
        setCheckins(infoData.checkins || []);

        if (endpoint) {
          setDeviceEndpoint(endpoint);
          const subs = Array.isArray(custData?.push_subscription)
            ? custData.push_subscription
            : custData?.push_subscription
              ? [custData.push_subscription]
              : [];
          const matched = subs.some((s: any) => s.endpoint === endpoint);
          setIsDeviceRegistered(matched);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load personalized customer skincare profile');
        setLoading(false);
      });

    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, [customerId]);

  const handleTimeUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setPreferredTime(newTime);
    setUpdatingTime(true);
    try {
      await axios.post(`https://cora-persona-backend.vercel.app/api/public/customer/${customerId}/schedule`, { time: newTime });
    } catch (err) {
      console.error('Failed to update preferred time:', err);
    }
    setTimeout(() => setUpdatingTime(false), 800);
  };

  const requestPermissionAndSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported on this browser. For iOS devices, make sure to add this page to your Home Screen first.');
      return;
    }

    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== 'granted') {
        alert('Permission denied. Please allow notifications in your browser settings to subscribe.');
        setSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const { data } = await axios.get('/api/store/campaigns/public-key');
      const publicKey = data.publicKey;

      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      } catch (err) {
        console.warn('Initial push subscription failed, performing unsubscription flush:', err);
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          await new Promise(resolve => setTimeout(resolve, 600));
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      let deviceName = 'Standard Browser';
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        deviceName = 'iPhone (Safari)';
      } else if (/Android/i.test(ua)) {
        deviceName = 'Android Phone';
      } else if (/Macintosh/i.test(ua)) {
        deviceName = 'MacBook';
      } else if (/Windows/i.test(ua)) {
        deviceName = 'Windows PC';
      }

      await axios.post('/api/store/campaigns/subscribe', {
        customerId,
        subscription,
        deviceName,
        customerDetails: {
          first_name: customer?.first_name || '',
          last_name: customer?.last_name || '',
          email: customer?.email || '',
          phone: customer?.phone || ''
        }
      });

      if (subscription?.endpoint) {
        setDeviceEndpoint(subscription.endpoint);
        setIsDeviceRegistered(true);
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(`Subscription failed: ${err.message}`);
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribeDevice = async () => {
    if (!deviceEndpoint) return;
    setUnsubscribing(true);
    try {
      await axios.post('/api/store/campaigns/unsubscribe', {
        customerId,
        endpoint: deviceEndpoint
      });

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
          }
        }
      }

      setIsDeviceRegistered(false);
      setDeviceEndpoint(null);
      setSuccess(false);
      alert('This device has been unsubscribed.');
    } catch (err: any) {
      console.error(err);
      alert(`Unsubscription failed: ${err.message}`);
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cora_storefront_customer_id');
    localStorage.removeItem('cora_customer_id');
    localStorage.removeItem('cora_customer_name');
    
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'cora-logout-success' }, '*');
    }
    
    router.push('/portal-login');
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-semibold tracking-wide">HYDRATING SKINCARE SEGMENTS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto font-sans">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 border border-red-100">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">{error}</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Verify your Shopify connection parameters or complete a routine sync setup to initialize your custom profile.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans antialiased text-slate-900 select-none pb-12 ${isIframe ? 'p-0' : 'p-6'}`}>
      
      {/* Outer Branding Container (Hidden if embedded inside theme iFrame) */}
      {!isIframe && (
        <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Sparkle className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wider uppercase">BHUTRI ESSENTIALS PORTAL</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </header>
      )}

      {/* Main Core Responsive Dashboard */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Customer Profile & Streak (1 Col) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Brand/User Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  {customer?.first_name} {customer?.last_name}
                </h2>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{customer?.email || customer?.phone}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/40 text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkle className="w-2.5 h-2.5 text-slate-900" /> {persona}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                Skin: {skinType}
              </span>
            </div>
            
            {isIframe && (
              <button 
                onClick={handleLogout}
                className="w-full mt-4 py-2 border border-slate-200 hover:border-slate-300 text-[10px] font-bold text-slate-600 rounded-xl hover:text-slate-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out from Sync
              </button>
            )}
          </div>

          {/* Daily Streak Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Skincare Streak
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 leading-none">{streak} Day Streak</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Log in daily on your synchronized devices to grow your skincare habit score.
                </p>
              </div>
            </div>
          </div>

          {/* Device Sync Registry */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-slate-400" /> Device Push Service
            </h3>

            {/* Notification Schedule Selection */}
            <div className="mb-4 space-y-2">
              <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Daily Notification Schedule
              </label>
              <div className="relative">
                <input 
                  type="time" 
                  value={preferredTime} 
                  onChange={handleTimeUpdate}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-70"
                  disabled={updatingTime}
                />
                {updatingTime && (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
              <p className="text-[9px] text-slate-500">Your routine check-ins will automatically trigger at this time.</p>
            </div>

            {isDeviceRegistered ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] leading-relaxed text-emerald-800">
                  <div className="flex gap-1.5 font-bold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> This Device Synchronised
                  </div>
                  You will receive real-time push reminders on this screen when your skin routines are updated!
                </div>
                <button
                  onClick={unsubscribeDevice}
                  disabled={unsubscribing}
                  className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {unsubscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Unsubscribe Current Screen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                  <div className="flex gap-1.5 font-bold text-slate-700 mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-slate-600" /> Device Connection Status
                  </div>
                  Lock-screen skincare reminders are currently inactive for this browser window.
                </div>

                {subscribing ? (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering Browser...
                  </button>
                ) : (
                  <button
                    onClick={requestPermissionAndSubscribe}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {isMobile ? 'Subscribe Phone Alert' : 'Subscribe Screen Alerts'}
                  </button>
                )}

                {permissionState === 'denied' && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200/60 text-[9px] text-red-600 font-semibold leading-relaxed flex gap-1 items-start">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Browser blocked push notifications. Reset notifications in site settings to connect.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Routine Check-In History */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" /> Routine Check-In History
            </h3>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {checkins.length > 0 ? (
                checkins.map((checkin: any, idx: number) => (
                  <div 
                    key={checkin.id || idx} 
                    className="p-3 border border-slate-100 rounded-xl bg-white flex items-center justify-between gap-3 text-[10px]"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {checkin.product_title || 'Daily Skincare'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                        {checkin.scheduled_at ? new Date(checkin.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
                      </p>
                    </div>
                    
                    <div>
                      {checkin.responded ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-400" /> Missed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-slate-400 font-semibold italic">No check-in responses recorded yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Custom Recommendations & Active Skincare Concerns (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Skin concerns & Details */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" /> Routine Focus Areas
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {concerns.length > 0 ? (
                concerns.map((concern, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {concern}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 font-semibold italic">General Hydration and Wellness Focus</span>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl text-[10px] text-slate-500 leading-relaxed flex gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
              <span>
                These targeted routine categories are dynamically generated based on active customer purchases, skincare segment data, and custom dashboard configurations.
              </span>
            </div>
          </div>

          {/* Skincare Recommendations Cards */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-slate-400" /> Active Skincare Routine
            </h3>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all bg-white relative flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step {idx + 1}</h4>
                      <h5 className="text-sm font-extrabold text-slate-900">{rec.title}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md">{rec.desc}</p>
                    </div>
                    {rec.product_handle && (
                      <a 
                        href={`https://ekg7ga-00.myshopify.com/products/${rec.product_handle}`}
                        target="_parent"
                        className="py-2 px-3 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-bold tracking-wider uppercase text-center transition-all cursor-pointer whitespace-nowrap"
                      >
                        Buy Product
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">No Active Recommendations Loaded</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Check in with Bhutri Essentials customer support to synchronize your skincare routine.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Purchased Products */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-slate-400" /> Synced Product Purchases
            </h3>

            <div className="space-y-3">
              {purchases.length > 0 ? (
                purchases.map((purchase: any, idx: number) => (
                  <div 
                    key={purchase.id || idx} 
                    className="p-4 border border-slate-200/50 rounded-xl bg-slate-50/30 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{purchase.product_title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {purchase.variant_title !== 'Default Title' ? purchase.variant_title : 'Standard Edition'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-950">
                        {purchase.quantity}x {parseFloat(purchase.price) ? `₹${parseFloat(purchase.price).toFixed(2)}` : 'Free'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Synced
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 font-semibold italic">No order sync history found.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-semibold tracking-wide">HYDRATING SKINCARE SEGMENTS...</p>
      </div>
    }>
      <CustomerProfileContent />
    </Suspense>
  );
}
