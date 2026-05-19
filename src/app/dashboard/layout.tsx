"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import { 
  Home, 
  Users, 
  Settings, 
  Send, 
  Menu, 
  X, 
  Sparkles, 
  Target, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  Smartphone,
  Bell,
  Check,
  Clock,
  Activity,
  Eye,
  XCircle
} from 'lucide-react';
import axios from 'axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper to render activity vector icons instead of emojis
  const renderActivityIcon = (type: string) => {
    const iconClass = "w-3.5 h-3.5";
    switch (type) {
      case 'subscribe':
        return <Smartphone className={`${iconClass} text-green-600`} />;
      case 'unsubscribe':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'checkin_applied':
        return <Check className={`${iconClass} text-emerald-600`} />;
      case 'checkin_later':
        return <Clock className={`${iconClass} text-amber-600`} />;
      case 'checkin_opened':
        return <Eye className={`${iconClass} text-blue-600`} />;
      case 'trigger_push':
        return <Sparkles className={`${iconClass} text-purple-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  // Real-time admin notifications state
  const [activities, setActivities] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }

    // Load read notification IDs from localStorage
    const getReadIds = (): string[] => {
      try {
        return JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
      } catch {
        return [];
      }
    };

    // Fetch activities initially and pool every 10s for live alerts
    const fetchActivities = async () => {
      try {
        const { data } = await axios.get('/api/store/activities');
        if (data?.activities) {
          setActivities(data.activities);
          
          const readIds = getReadIds();
          const unread = data.activities.filter((act: any) => !readIds.includes(act.id));
          setUnreadCount(unread.length);
        }
      } catch (err) {
        console.error('Error in live activity pooling:', err);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 8000);

    // Handle clicks outside of notification popover
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleMarkAllRead = () => {
    const allIds = activities.map((act: any) => act.id);
    localStorage.setItem('admin_read_notifications', JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const handleNotificationClick = (act: any) => {
    // Mark as read
    const readIds = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    if (!readIds.includes(act.id)) {
      readIds.push(act.id);
      localStorage.setItem('admin_read_notifications', JSON.stringify(readIds));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsNotificationsOpen(false);

    // Navigate to customer detail persona
    router.push(`/dashboard/customers/${act.shopify_customer_id || act.customer_id}`);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems: Array<{ href: string; label: string; icon: any; badge?: string }> = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/subscribers', label: 'Subscribers', icon: Smartphone },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/personas', label: 'Personas', icon: Target },
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: Send },
    { href: '/dashboard/integrations', label: 'Integrations', icon: Zap },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const getMobileTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/dashboard/customers')) return 'Customers';
    if (pathname === '/dashboard/subscribers') return 'Subscribers';
    if (pathname === '/dashboard/orders') return 'Orders';
    if (pathname === '/dashboard/products') return 'Products';
    if (pathname === '/dashboard/personas') return 'Personas';
    if (pathname === '/dashboard/campaigns') return 'Campaigns';
    if (pathname === '/dashboard/integrations') return 'Integrations';
    if (pathname === '/dashboard/settings') return 'Settings';
    return 'Cora';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#111111] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1a1a1a] font-sans flex flex-col lg:flex-row relative">
      
      {/* 1. MOBILE TOP STICKY HEADER */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E5E5] z-50 px-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center text-[#111111] font-bold text-sm tracking-tight gap-1">
          <Sparkles className="w-4 h-4 text-[#111111]" />
          <span>Cora</span>
        </div>

        <div className="text-[#111111] font-bold text-base tracking-tight">
          {getMobileTitle()}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Bell */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl border border-[#E5E5E5] hover:bg-[#F3F4F6] relative transition-all"
            >
              <Bell className="w-4.5 h-4.5 text-[#111111]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="w-8 h-8 flex items-center justify-center">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-7 h-7" } }} />
          </div>
        </div>
      </header>

      {/* 2. MOBILE APP BOTTOM TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] z-40 flex justify-around items-center px-2 pb-safe-offset-1 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            pathname === '/dashboard' ? 'text-[#111111]' : 'text-[#8A8A8A]'
          }`}
        >
          <Home className="w-[20px] h-[20px] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </Link>

        <Link 
          href="/dashboard/customers"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            pathname.startsWith('/dashboard/customers') ? 'text-[#111111]' : 'text-[#8A8A8A]'
          }`}
        >
          <Users className="w-[20px] h-[20px] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Customers</span>
        </Link>

        <Link 
          href="/dashboard/personas"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            pathname === '/dashboard/personas' ? 'text-[#111111]' : 'text-[#8A8A8A]'
          }`}
        >
          <Target className="w-[20px] h-[20px] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Personas</span>
        </Link>

        <Link 
          href="/dashboard/campaigns"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            pathname === '/dashboard/campaigns' ? 'text-[#111111]' : 'text-[#8A8A8A]'
          }`}
        >
          <Send className="w-[20px] h-[20px] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Campaigns</span>
        </Link>

        <button 
          onClick={() => setIsMenuSheetOpen(true)}
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            isMenuSheetOpen || pathname === '/dashboard/settings' || pathname === '/dashboard/integrations' || pathname === '/dashboard/products' || pathname === '/dashboard/orders' ? 'text-[#111111]' : 'text-[#8A8A8A]'
          }`}
        >
          <Menu className="w-[20px] h-[20px] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">More</span>
        </button>
      </nav>

      {/* 3. MOBILE APP NATIVE SLIDE-UP BOTTOM SHEET */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
          isMenuSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={() => setIsMenuSheetOpen(false)}
          className="absolute inset-0 bg-[#111111]/30 backdrop-blur-sm"
        />

        <div 
          className={`absolute bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-[#E5E5E5] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] p-6 pb-8 transition-transform duration-300 ease-out transform ${
            isMenuSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="w-12 h-1 bg-[#D4D4D4] rounded-full mx-auto mb-6" />

          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-bold text-base text-[#111111]">More Workspace</h3>
            <button 
              onClick={() => setIsMenuSheetOpen(false)}
              className="p-1.5 rounded-lg text-[#616161] hover:bg-[#EAEAEA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link 
              href="/dashboard/orders"
              onClick={() => setIsMenuSheetOpen(false)}
              className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                pathname === '/dashboard/orders'
                  ? 'bg-white border-[#111111] text-[#111111] shadow-sm font-semibold' 
                  : 'bg-white border-[#E5E5E5] text-[#444444] hover:border-[#111111]'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <span className="text-xs font-semibold">Orders</span>
            </Link>

            <Link 
              href="/dashboard/products"
              onClick={() => setIsMenuSheetOpen(false)}
              className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                pathname === '/dashboard/products'
                  ? 'bg-white border-[#111111] text-[#111111] shadow-sm font-semibold' 
                  : 'bg-white border-[#E5E5E5] text-[#444444] hover:border-[#111111]'
              }`}
            >
              <Package className="w-5 h-5 text-[#111111]" />
              <span className="text-xs font-semibold">Products</span>
            </Link>

            <Link 
              href="/dashboard/integrations"
              onClick={() => setIsMenuSheetOpen(false)}
              className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                pathname === '/dashboard/integrations'
                  ? 'bg-white border-[#111111] text-[#111111] shadow-sm font-semibold' 
                  : 'bg-white border-[#E5E5E5] text-[#444444] hover:border-[#111111]'
              }`}
            >
              <Zap className="w-5 h-5 text-[#111111]" />
              <span className="text-xs font-semibold">Integrations</span>
            </Link>

            <Link 
              href="/dashboard/settings"
              onClick={() => setIsMenuSheetOpen(false)}
              className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                pathname === '/dashboard/settings'
                  ? 'bg-white border-[#111111] text-[#111111] shadow-sm font-semibold' 
                  : 'bg-white border-[#E5E5E5] text-[#444444] hover:border-[#111111]'
              }`}
            >
              <Settings className="w-5 h-5 text-[#111111]" />
              <span className="text-xs font-semibold">Settings</span>
            </Link>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm space-y-4">
            <OrganizationSwitcher 
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: "w-full justify-between px-2.5 py-2 hover:bg-[#F9FAFB] rounded-xl border border-[#E5E5E5]"
                }
              }}
            />
            <div className="pt-3 border-t border-[#E5E5E5] flex items-center px-1">
              <UserButton showName appearance={{ elements: { userButtonBox: "flex-row-reverse w-full justify-between" } }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 bg-[#F7F7F7] flex-col justify-between border-r border-[#E5E5E5] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          <div className={`h-16 flex items-center justify-between px-5 ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div className="flex items-center text-[#111111] font-bold text-lg tracking-tight animate-in fade-in duration-200">
                <Sparkles className="w-5 h-5 mr-2" />
                Cora
              </div>
            )}
            {isCollapsed && (
              <div className="flex items-center justify-center text-[#111111] font-bold text-lg">
                <Sparkles className="w-5 h-5" />
              </div>
            )}

            <button 
              onClick={toggleCollapse}
              className={`p-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F3F4F6] text-[#616161] hover:text-[#111111] transition-all ${
                isCollapsed ? 'mt-2' : ''
              }`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="py-4 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="group relative">
                    <Link 
                      href={item.href}
                      className={`flex items-center rounded-xl transition-all ${
                        isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 justify-between'
                      } ${
                        isActive 
                          ? 'bg-white text-[#111111] border border-[#E5E5E5] shadow-sm font-semibold' 
                          : 'text-[#444444] hover:bg-[#EAEAEA] font-medium'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`w-[18px] h-[18px] ${isCollapsed ? 'mr-0' : 'mr-3'} ${isActive ? 'text-[#1a1a1a]' : 'text-[#616161]'}`} />
                        {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                      </div>
                    </Link>

                    {isCollapsed && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#111111] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className={`p-3 mt-auto mb-4 mx-3 transition-all ${
          isCollapsed ? 'bg-transparent border-0 mx-0 p-0 mb-6 flex flex-col items-center gap-4' : 'bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-4'
        }`}>
          {!isCollapsed ? (
            <>
              <OrganizationSwitcher 
                hidePersonal
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    organizationSwitcherTrigger: "w-full justify-between px-2.5 py-2 hover:bg-[#F9FAFB] rounded-xl border border-[#E5E5E5]"
                  }
                }}
              />
              <div className="pt-3 border-t border-[#E5E5E5] flex items-center px-1">
                <UserButton showName appearance={{ elements: { userButtonBox: "flex-row-reverse w-full justify-between" } }} />
              </div>
            </>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            </div>
          )}
        </div>
      </aside>

      {/* 5. RESPONSIVE MAIN CONTENT FRAME */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Desktop Top Bar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-[#E5E5E5] px-8 items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
          <div className="text-sm font-bold text-[#111111] tracking-tight">
            Dashboard &gt; <span className="text-[#6B7280]">{getMobileTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl border border-[#E5E5E5] hover:bg-[#F3F4F6] relative transition-all active:scale-95 flex items-center justify-center"
              >
                <Bell className="w-4.5 h-4.5 text-[#111111]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Glassmorphic Dropdown Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden text-xs">
                  <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
                    <p className="font-bold text-[#111111]">Admin Activity Alerts</p>
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  </div>

                  <div className="divide-y divide-[#F3F4F6] max-h-80 overflow-y-auto">
                    {activities.length === 0 ? (
                      <div className="p-8 text-center text-[#9CA3AF]">
                        No recent customer activity.
                      </div>
                    ) : (
                      activities.map((act: any) => {
                        // Check if read
                        const isRead = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]').includes(act.id);

                        return (
                          <div 
                            key={act.id} 
                            onClick={() => handleNotificationClick(act)}
                            className={`p-3.5 hover:bg-[#FAFAFA] transition-colors cursor-pointer flex gap-3 ${!isRead ? 'bg-purple-50/40' : ''}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                              {renderActivityIcon(act.activity_type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-[#111111] truncate ${!isRead ? 'font-bold' : ''}`}>
                                {act.first_name} {act.last_name}
                              </p>
                              <p className="text-[#6B7280] text-[10px] mt-0.5 leading-snug">
                                {act.details}
                              </p>
                              <p className="text-[9px] text-[#9CA3AF] mt-1.5 font-medium">
                                {new Date(act.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-24 lg:pt-0 pb-24 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto relative">
            
            {/* Absolute Glassmorphic Notifications Popover for Mobile */}
            {isNotificationsOpen && (
              <div className="lg:hidden absolute top-2 right-4 w-[calc(100vw-32px)] bg-white border border-[#E5E5E5] rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
                  <p className="font-bold text-[#111111]">Admin Activity Alerts</p>
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                </div>

                <div className="divide-y divide-[#F3F4F6] max-h-80 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center text-[#9CA3AF]">
                      No recent customer activity.
                    </div>
                  ) : (
                    activities.map((act: any) => {
                      const isRead = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]').includes(act.id);

                      return (
                        <div 
                          key={act.id} 
                          onClick={() => handleNotificationClick(act)}
                          className={`p-3.5 hover:bg-[#FAFAFA] transition-colors cursor-pointer flex gap-3 ${!isRead ? 'bg-purple-50/40' : ''}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                            {renderActivityIcon(act.activity_type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#111111] truncate">
                              {act.first_name} {act.last_name}
                            </p>
                            <p className="text-[#6B7280] text-[10px] mt-0.5 leading-snug">
                              {act.details}
                            </p>
                            <p className="text-[9px] text-[#9CA3AF] mt-1.5 font-medium">
                              {new Date(act.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!isRead && (
                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0 mt-2"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
