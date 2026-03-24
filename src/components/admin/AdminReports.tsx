import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Activity, 
  Building2, 
  Pill, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  Search
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";
import { useEffect } from "react";

const AdminReports: React.FC = () => {
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
      logAction(mockUser, "access", "reports", "access", "Accessed the reports and analytics module");
    }
  }, []);

  if (!checkPermission(mockUser, "view_reports")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Activity size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [reportType, setReportType] = useState("daily");
  const [loading, setLoading] = useState(false);

  const performanceData = [
    { name: "مستشفى الثورة", score: 92, patients: 1200 },
    { name: "مستشفى السبعين", score: 88, patients: 950 },
    { name: "مستشفى الجمهوري", score: 85, patients: 880 },
    { name: "مستشفى الكويت", score: 82, patients: 720 },
    { name: "مستشفى العسكري", score: 78, patients: 650 },
  ];

  const drugUsageData = [
    { name: "أموكسيسيلين", usage: 4500 },
    { name: "باراسيتامول", usage: 8200 },
    { name: "أنسولين", usage: 1200 },
    { name: "فيتامين د", usage: 3400 },
    { name: "أوميبرازول", usage: 2100 },
  ];

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportCards = [
    { title: "التقرير اليومي", desc: "ملخص النشاط الصحي خلال 24 ساعة", icon: Calendar, type: "daily" },
    { title: "التقرير الشهري", desc: "تحليل الأداء والاتجاهات الشهرية", icon: Activity, type: "monthly" },
    { title: "أداء المنشآت", desc: "تقييم جودة الخدمة وسعة الاستيعاب", icon: Building2, type: "performance" },
    { title: "استهلاك الأدوية", desc: "رصد المخزون والاحتياج الدوائي", icon: Pill, type: "drugs" },
  ];

  return (
    <AdminLayout title="نظام التقارير والتحليلات">
      <div className="space-y-8">
        {/* Report Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReportType(card.type)}
              className={`p-6 rounded-[32px] border-2 text-right transition-all group ${
                reportType === card.type 
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/20" 
                  : "bg-white border-slate-100 text-slate-900 hover:border-blue-200"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                reportType === card.type ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
              }`}>
                <card.icon size={24} />
              </div>
              <h3 className="text-lg font-black mb-1">{card.title}</h3>
              <p className={`text-xs font-bold ${reportType === card.type ? "text-blue-100" : "text-slate-500"}`}>
                {card.desc}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">مؤشرات أداء المستشفيات</h3>
                <p className="text-xs text-slate-500 font-bold">تقييم الجودة بناءً على رضا المرضى وسرعة الخدمة</p>
              </div>
              <button 
                onClick={() => exportToCSV(performanceData, "hospital_performance")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
              >
                <Download size={16} />
                تصدير CSV
              </button>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                    width={120}
                  />
                  <Tooltip 
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 85 ? "#10b981" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drug Usage Stats */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">الأدوية الأكثر استهلاكاً</h3>
              <p className="text-xs text-slate-500 font-bold">رصد الاحتياج الدوائي الوطني</p>
            </div>

            <div className="space-y-6">
              {drugUsageData.map((drug, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900">{drug.name}</span>
                    <span className="text-xs font-bold text-slate-500">{drug.usage.toLocaleString()} وحدة</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(drug.usage / 10000) * 100}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
              <FileText size={16} />
              تقرير المخزون الدوائي الكامل
            </button>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">إحصائيات تفصيلية</h3>
              <p className="text-xs text-slate-500 font-bold">بيانات الأداء المجمعة للمحافظات</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="بحث في المحافظات..."
                  className="bg-slate-50 border-transparent rounded-xl pr-10 pl-4 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المحافظة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">إجمالي الزيارات</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحالات الحرجة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">نسبة الشفاء</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">النمو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { region: "صنعاء", visits: "12,450", critical: "450", recovery: "94%", growth: "+12%" },
                  { region: "عدن", visits: "8,920", critical: "320", recovery: "92%", growth: "+8%" },
                  { region: "تعز", visits: "10,150", critical: "510", recovery: "89%", growth: "+15%" },
                  { region: "حضرموت", visits: "6,780", critical: "180", recovery: "96%", growth: "+5%" },
                  { region: "الحديدة", visits: "9,430", critical: "420", recovery: "88%", growth: "+10%" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4 text-sm font-black text-slate-900">{row.region}</td>
                    <td className="px-8 py-4 text-sm font-bold text-slate-600">{row.visits}</td>
                    <td className="px-8 py-4 text-sm font-bold text-rose-600">{row.critical}</td>
                    <td className="px-8 py-4 text-sm font-bold text-emerald-600">{row.recovery}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1 text-xs font-black text-emerald-600">
                        <ArrowUpRight size={14} />
                        {row.growth}
                      </div>
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

export default AdminReports;
