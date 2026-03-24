import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  ClipboardList, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  Activity,
  LogOut,
  LayoutDashboard,
  Users,
  FlaskConical,
  Pill,
  Radio,
  Syringe,
  Calendar,
  MapPin,
  Bot,
  Building2,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  QrCode
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  role: string | null;
  title?: string;
}

import { authService } from "../services/authService";

const MainLayout: React.FC<MainLayoutProps> = ({ children, role, title = "النظام الصحي الوطني" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(localStorage.getItem('lastSync') || 'لم يتم المزامنة بعد');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    // Mock sync
    setTimeout(() => {
      const now = new Date().toLocaleString('ar-YE');
      setLastSync(now);
      localStorage.setItem('lastSync', now);
      setIsSyncing(false);
    }, 1500);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/");
  };

  const navItems = [
    { to: "/home", icon: Home, label: "الرئيسية" },
    { to: "/health-card", icon: ShieldCheck, label: "بطاقتي" },
    { to: "/patients", icon: ClipboardList, label: "السجل الطبي" },
    { to: "/search", icon: Search, label: "البحث" },
    { to: "/profile", icon: User, label: "الحساب" },
  ];

  const sidebarItems = [
    { to: "/home", icon: LayoutDashboard, label: "لوحة التحكم" },
    { to: "/health-card", icon: ShieldCheck, label: "بطاقتي الصحية" },
    { to: "/patients", icon: Users, label: "إدارة المرضى" },
    { to: "/labs", icon: FlaskConical, label: "نتائج المختبر" },
    { to: "/prescriptions", icon: Pill, label: "الوصفات الطبية" },
    { to: "/radiology", icon: Radio, label: "الأشعة والتحاليل" },
    { to: "/vaccination", icon: Syringe, label: "سجل التطعيمات" },
    { to: "/appointments", icon: Calendar, label: "المواعيد" },
    { to: "/map", icon: MapPin, label: "الخريطة الصحية" },
    { to: "/ai", icon: Bot, label: "المساعد الذكي" },
    { to: "/facilities", icon: Building2, label: "المنشآت الصحية" },
    ...(role === 'admin' || role === 'regional_admin' ? [
      { to: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم الوطنية" },
      { to: "/epidemiology", icon: TrendingUp, label: "الرصد الوبائي" },
      { to: "/analytics", icon: Activity, label: "التحليلات الوطنية" }
    ] : []),
  ];

  const isHome = location.pathname === "/home" || location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-gov-blue text-white transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}>
        <div className="p-8 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gov-blue shadow-xl">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none">النظام الصحي الوطني</h1>
            <p className="text-[8px] text-blue-100 mt-1 font-bold uppercase tracking-wider">National Digital Health System</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden mr-auto p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="p-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {sidebarItems.map((item) => (
            <button 
              key={item.to}
              onClick={() => {
                navigate(item.to);
                setIsSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 text-sm font-black rounded-xl transition-all flex items-center gap-3 group ${
                location.pathname === item.to ? "bg-white/20 text-white" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gov-blue space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-rose-400" />}
              <span className={`text-[10px] font-bold ${isOnline ? "text-emerald-400" : "text-rose-400"}`}>
                {isOnline ? "متصل" : "غير متصل"}
              </span>
            </div>
            <button 
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className={`p-2 rounded-lg transition-all ${isSyncing ? "animate-spin" : ""} ${!isOnline ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-2 text-[8px] text-blue-200 font-bold">
            <Clock size={10} />
            آخر مزامنة: {lastSync}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 text-sm font-black text-rose-200 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all flex items-center gap-3 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:mr-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gov-blue rounded-lg flex items-center justify-center text-white md:hidden">
                <Activity size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-900 font-display hidden sm:block">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isOnline && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black border border-rose-100">
                <WifiOff size={14} />
                وضع عدم الاتصال
              </div>
            )}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-black text-slate-900">التنبيهات</h3>
                    </div>
                    <div className="p-8 text-center text-slate-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-bold">لا توجد تنبيهات جديدة</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-10 h-10 bg-gov-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 cursor-pointer" onClick={() => navigate("/profile")}>
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Bar (Mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around md:hidden z-40">
          {navItems.map((item) => (
            <button 
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                location.pathname === item.to ? "text-gov-blue" : "text-slate-400"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-black">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MainLayout;
