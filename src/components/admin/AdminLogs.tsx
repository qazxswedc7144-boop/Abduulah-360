import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldAlert,
  Search, 
  Filter, 
  Clock, 
  User, 
  Globe, 
  Monitor, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2,
  Download,
  Terminal,
  Database,
  Activity
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminLogs: React.FC = () => {
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

  useEffect(() => {
    if (checkPermission(mockUser, "access_admin_dashboard")) {
      logAction(mockUser, "access", "system_logs", "access", "Accessed the system audit logs");
    }
  }, []);

  if (!checkPermission(mockUser, "access_admin_dashboard")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <ShieldAlert size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100)),
      (snap) => {
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsub();
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "login": return <Unlock size={16} className="text-emerald-500" />;
      case "logout": return <Lock size={16} className="text-slate-500" />;
      case "security_alert": return <AlertCircle size={16} className="text-rose-500" />;
      case "data_export": return <Download size={16} className="text-blue-500" />;
      case "system_update": return <Activity size={16} className="text-purple-500" />;
      default: return <Terminal size={16} className="text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.action || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || l.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout title="سجلات النظام والأمن">
      <div className="space-y-8">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">تنبيهات أمنية (24س)</p>
              <h3 className="text-xl font-black text-slate-900">0</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">محاولات دخول ناجحة</p>
              <h3 className="text-xl font-black text-slate-900">1,240</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">حالة قواعد البيانات</p>
              <h3 className="text-xl font-black text-emerald-600">مستقر</h3>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث في السجلات..."
                  className="w-full bg-slate-50 border-transparent rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-50 border-transparent rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">كافة العمليات</option>
                <option value="login">تسجيل دخول</option>
                <option value="logout">تسجيل خروج</option>
                <option value="security_alert">تنبيه أمني</option>
                <option value="data_export">تصدير بيانات</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg shadow-slate-900/20">
              <Download size={18} />
              تصدير السجلات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">العملية</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المستخدم</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">التفاصيل</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">عنوان IP</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getLogIcon(log.type)}
                        </div>
                        <span className="text-xs font-black text-slate-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-500">
                      {log.details}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Monitor size={14} />
                        {log.ipAddress || "127.0.0.1"}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={14} />
                        {log.timestamp ? new Date(log.timestamp).toLocaleString("ar-YE") : "---"}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <Terminal size={48} className="opacity-20" />
                        <p className="text-sm font-black">لا توجد سجلات حالياً</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
