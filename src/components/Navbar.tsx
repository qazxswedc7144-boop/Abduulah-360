import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Activity, 
  LogOut, 
  User, 
  Bell, 
  Search, 
  Menu,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Stethoscope,
  Pill,
  Users,
  MapPin
} from "lucide-react";

interface NavbarProps {
  role: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Mock logout
    navigate("/auth");
  };

  // Mock user display name
  const mockDisplayName = "مستخدم تجريبي";

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-[10px] border-b border-white/20 px-8 py-5" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-10">
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-4 group shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-xl shadow-indigo-900/20">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black text-white leading-none tracking-tight font-display">النظام الصحي الوطني</h1>
            <p className="text-[10px] text-slate-400 mt-1.5 font-black tracking-[0.1em] uppercase">National Digital Health System</p>
          </div>
        </Link>

        {/* Navigation Links - Centered */}
        <div className="hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-[20px] border border-white/20">
          {[
            { to: "/home", icon: LayoutDashboard, label: "لوحة التحكم" },
            { to: "/health-card", icon: ShieldCheck, label: "بطاقتي الصحية" },
            { to: "/patients", icon: Users, label: "المرضى" },
            { to: "/prescriptions", icon: Pill, label: "الوصفات" },
            { to: "/map", icon: MapPin, label: "الخارطة" },
          ].map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className="px-5 py-2.5 text-sm font-black text-slate-200 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 flex items-center gap-2.5 group border border-transparent hover:border-white/10"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform" />
              {item.label}
            </Link>
          ))}
          {role === 'pharmacy' && (
            <Link to="/pharmacy" className="px-5 py-2.5 text-sm font-black text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-2xl transition-all flex items-center gap-2.5 border border-indigo-500/20">
              <ShieldCheck size={18} />
              الصيدلية
            </Link>
          )}
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Search Trigger (Mobile/Tablet) */}
          <button className="xl:hidden w-11 h-11 bg-white/10 backdrop-blur-md text-slate-200 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/20">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="w-11 h-11 bg-white/10 backdrop-blur-md text-slate-200 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all relative border border-white/20 group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </button>
          
          <div className="h-8 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-4 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none font-display">{mockDisplayName}</p>
              <p className="text-[10px] text-indigo-400 font-black mt-1.5 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md inline-block border border-indigo-500/10">
                {role === 'admin' ? 'مدير النظام' : role === 'doctor' ? 'طبيب' : role === 'pharmacy' ? 'صيدلي' : 'مستخدم'}
              </p>
            </div>
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md text-slate-200 rounded-2xl flex items-center justify-center border border-white/20 shadow-sm">
              <User size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Trigger */}
          <button className="xl:hidden w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
