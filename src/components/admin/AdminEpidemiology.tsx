import React, { useState, useEffect } from "react";
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Info
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminEpidemiology: React.FC = () => {
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
    if (checkPermission(mockUser, "view_reports")) {
      logAction(mockUser, "access", "epidemiology", "access", "Accessed the epidemiology module");
    }
  }, []);

  if (!checkPermission(mockUser, "view_reports")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <AlertTriangle size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "epidemiology"), orderBy("timestamp", "desc")),
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setReports(data);
        
        // Check for spikes (e.g., cases > 100)
        const newAlerts = data.filter((r: any) => r.cases > 100 || r.riskLevel === "critical");
        setAlerts(newAlerts);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const COLORS = ["#3b82f6", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  const diseaseData = [
    { name: "الكوليرا", value: 450 },
    { name: "حمى الضنك", value: 320 },
    { name: "الملاريا", value: 280 },
    { name: "شلل الأطفال", value: 15 },
    { name: "أخرى", value: 120 },
  ];

  const trendData = [
    { date: "03/01", cases: 45 },
    { date: "03/05", cases: 52 },
    { date: "03/10", cases: 85 },
    { date: "03/15", cases: 120 },
    { date: "03/20", cases: 110 },
    { date: "03/23", cases: 145 },
  ];

  return (
    <AdminLayout title="الرصد الوبائي الوطني">
      <div className="space-y-8">
        {/* Alerts Section */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="text-rose-600" size={20} />
                <h3 className="text-sm font-black text-slate-900">تنبيهات صحية عاجلة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.map((alert, i) => (
                  <motion.div 
                    key={alert.id}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-rose-900">ارتفاع حالات {alert.disease}</h4>
                      <p className="text-[10px] text-rose-700 font-bold">
                        تم رصد {alert.cases} حالة في منطقة {alert.region} خلال الـ 24 ساعة الماضية.
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <button className="text-[10px] font-black text-white bg-rose-600 px-3 py-1 rounded-lg hover:bg-rose-700 transition-all">
                          اتخاذ إجراء
                        </button>
                        <button className="text-[10px] font-black text-rose-600 hover:underline">
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">منحنى انتشار الأوبئة</h3>
                <p className="text-xs text-slate-500 font-bold">إجمالي الحالات المسجلة وطنياً خلال الشهر الحالي</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                  <Download size={20} />
                </button>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-black shadow-sm">يومي</button>
                  <button className="px-4 py-1.5 text-slate-500 rounded-lg text-xs font-black">أسبوعي</button>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: "#3b82f6", strokeWidth: 3, stroke: "#fff" }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disease Distribution */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">توزيع الأمراض</h3>
              <p className="text-xs text-slate-500 font-bold">نسبة انتشار الأمراض المعدية الرئيسية</p>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600">الكوليرا</span>
                </div>
                <span className="text-xs font-black text-slate-900">38%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600">حمى الضنك</span>
                </div>
                <span className="text-xs font-black text-slate-900">27%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600">الملاريا</span>
                </div>
                <span className="text-xs font-black text-slate-900">23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">سجل البلاغات الوبائية</h3>
              <p className="text-xs text-slate-500 font-bold">آخر البلاغات الواردة من المحافظات</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all">
                <Filter size={16} />
                تصفية
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
                <Plus size={16} />
                بلاغ جديد
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المرض</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المنطقة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">عدد الحالات</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">مستوى الخطر</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Activity size={16} />
                        </div>
                        <span className="text-sm font-black text-slate-900">{report.disease}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {report.region}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-black text-slate-900">{report.cases}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        report.riskLevel === "critical" ? "bg-rose-100 text-rose-600" :
                        report.riskLevel === "high" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        {report.riskLevel === "critical" ? "حرج" :
                         report.riskLevel === "high" ? "مرتفع" : "طبيعي"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={14} />
                        {new Date(report.timestamp).toLocaleDateString("ar-YE")}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Info size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEpidemiology;
