import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Activity, 
  Map as MapIcon, 
  FileText, 
  Users, 
  Building2, 
  Shield,
  ShieldAlert, 
  ArrowRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { checkPermission, Permission } from "../../lib/rbac";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin", permission: "access_admin_dashboard" as Permission },
    { icon: Activity, label: "الرصد الوبائي", path: "/admin/epidemiology", permission: "view_reports" as Permission },
    { icon: MapIcon, label: "الخارطة الوطنية", path: "/admin/map", permission: "view_reports" as Permission },
    { icon: FileText, label: "التقارير", path: "/admin/reports", permission: "view_reports" as Permission },
    { icon: Users, label: "إدارة المستخدمين", path: "/admin/users", permission: "manage_users" as Permission },
    { icon: Shield, label: "الأدوار والصلاحيات", path: "/admin/roles", permission: "manage_users" as Permission },
    { icon: Building2, label: "المنشآت الصحية", path: "/admin/facilities", permission: "manage_facilities" as Permission },
    { icon: ShieldAlert, label: "سجلات النظام", path: "/admin/logs", permission: "access_admin_dashboard" as Permission },
  ];

  // Mock user for permission check (in real app, get from auth context)
  const mockUser = {
    uid: "mock-user-id",
    email: "admin@health.gov.ye",
    role: "admin" as any,
    permissions: [
      "access_admin_dashboard",
      "view_reports",
      "manage_users",
      "manage_facilities"
    ] as any
  };

  const filteredMenuItems = menuItems.filter(item => 
    checkPermission(mockUser, item.permission)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col sticky top-0 h-screen z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity size={20} />
              </div>
              <span className="font-black text-sm tracking-tight">وزارة الصحة</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-blue-400"} />
                {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/home"
            className="flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <ArrowRight size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">الرجوع للرئيسية</span>}
          </Link>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-900">{title}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث في النظام..."
                className="bg-slate-100 border-transparent rounded-xl pr-10 pl-4 py-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none w-64"
              />
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">مسؤول النظام</p>
                <p className="text-[10px] text-slate-500 font-bold">وزارة الصحة العامة</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
