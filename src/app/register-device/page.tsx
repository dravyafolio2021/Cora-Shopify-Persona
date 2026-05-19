"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Bell, CheckCircle2, Shield, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

function RegisterDeviceContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setError('Missing customerId parameter');
      setLoading(false);
      return;
    }

    axios.get(`/api/store/customers/${customerId}`)
      .then(res => {
        setCustomer(res.data.customer);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch customer profile details');
        setLoading(false);
      });

    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, [customerId]);

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
      console.log('Service Worker registered:', registration);

      const { data } = await axios.get('/api/store/campaigns/public-key');
      const publicKey = data.publicKey;

      let subscription;
      try {
        // First try to subscribe directly
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      } catch (err) {
        console.warn('Initial push subscription failed, performing fresh unsubscription tear-down and retrying:', err);
        
        // If it fails, clear any active registration to resolve token conflicts & browser push service error
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          // Allow 600ms for browser engine database to cleanly flush
          await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Retry fresh subscription request
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      // Detect browser and device name dynamically
      let deviceName = 'Standard Browser';
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        deviceName = 'iPhone';
        if (/Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS/i.test(ua)) {
          deviceName = 'iPhone (Safari)';
        } else {
          deviceName = 'iPhone (Webview)';
        }
      } else if (/Android/i.test(ua)) {
        deviceName = 'Android Device';
        if (/Chrome/i.test(ua)) {
          deviceName = 'Android Phone (Chrome)';
        }
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

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(`Subscription failed: ${err.message}`);
    } finally {
      setSubscribing(false);
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-sm text-[#6B7280]">Configuring skincare portal device synchronisation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#111111]">{error}</h2>
        <p className="text-xs text-[#6B7280] mt-2">Make sure you scan the QR code directly from your Cora Admin Settings or Customer profile detail card.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF2F2] via-white to-[#F5F3FF] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 max-w-sm w-full shadow-xl">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-inner">
            <Bell className="w-8 h-8 animate-swing" />
          </div>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111111]">Device Subscribed!</h2>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                Awesome, <span className="font-bold text-[#111111]">{customer?.first_name || 'Skincare Tester'}</span>! This physical phone is now officially synchronized to receive lock-screen check-in reminders.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-left text-xs text-purple-700">
              <p className="font-bold mb-1 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 fill-purple-700" /> What's next?</p>
              Return to your Cora Admin Console and tap **"Send Test Push"** on this profile to see the real lock-screen alert pop up on this screen!
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">
                Cora Skin Portal
              </span>
              <h2 className="text-xl font-bold text-[#111111] mt-4">Join Skincare Routine</h2>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                Connect your mobile phone to receive daily skincare routine application reminders and update your daily streak.
              </p>
            </div>

            <div className="p-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl text-left text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-bold text-[#111111]">Privacy Protected</p>
                  <p className="text-[#6B7280] mt-0.5">We only store standard anonymous browser token IDs to route notifications.</p>
                </div>
              </div>
            </div>

            {subscribing ? (
              <button
                disabled
                className="w-full py-3.5 bg-[#111111] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing device...
              </button>
            ) : (
              <button
                onClick={requestPermissionAndSubscribe}
                className="w-full py-3.5 bg-[#111111] text-white rounded-xl text-sm font-bold hover:bg-[#333333] transition-all shadow-md active:scale-[0.98]"
              >
                🔔 Subscribe Phone
              </button>
            )}

            {permissionState === 'denied' && (
              <p className="text-[10px] text-red-500 font-medium">
                ⚠️ Push permission is currently blocked. Please open your device browser settings, search for site settings, and allow notifications for Cora.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function RegisterDevicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-sm text-[#6B7280]">Configuring skincare portal device synchronisation...</p>
      </div>
    }>
      <RegisterDeviceContent />
    </Suspense>
  );
}
