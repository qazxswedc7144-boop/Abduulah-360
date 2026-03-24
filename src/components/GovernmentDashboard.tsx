import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Activity, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Map as MapIcon, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Bell,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../services/mockDataService";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";

const GovernmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patientCount, setPatientCount] = useState<number>(0);

  useEffect(() => {
    const patients = mockDataService.getPatients();
    setPatientCount(patients.length);
  }, []);
  
  const stats = [
    { label: "إجمالي المواطنين المسجلين", value: (12450230 + patientCount).toLocaleString('ar-YE'), trend: "+2.4%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "المنشآت الصحية النشطة", value: "3,120", trend: "+12", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "معدل الإشغال السريري", value: "78%", trend: "-5%", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "تنبيهات وبائية نشطة", value: "4", trend: "عالي", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const diseaseTrends = [
    { name: "يناير", cases: 400, prev: 300 },
    { name: "فبراير", cases: 300, prev: 400 },
    { name: "مارس", cases: 600, prev: 500 },
    { name: "أبريل", cases: 800, prev: 700 },
    { name: "مايو", cases: 500, prev: 600 },
    { name: "يونيو", cases: 900, prev: 800 },
  ];

  const hospitalLoad = [
    { name: "صنعاء", load: 85 },
    { name: "عدن", load: 72 },
    { name: "تعز", load: 90 },
    { name: "حضرموت", load: 65 },
    { name: "الحديدة", load: 88 },
    { name: "إب", load: 75 },
  ];

  const regionalNodes = [
    { name: "صنعاء", status: "نشط", type: "العقدة الرئيسية", load: "85%", color: "bg-emerald-500" },
    { name: "عدن", status: "نشط", type: "عقدة احتياطية", load: "72%", color: "bg-emerald-500" },
    { name: "تعز", status: "نشط", type: "عقدة إقليمية", load: "90%", color: "bg-amber-500" },
    { name: "حضرموت", status: "نشط", type: "عقدة إقليمية", load: "65%", color: "bg-emerald-500" },
    { name: "الحديدة", status: "تحذير", type: "عقدة إقليمية", load: "88%", color: "bg-rose-500" },
  ];

  const systemComponents = [
    { name: "تطبيق المواطن", status: "نشط", load: `${(1.2 + patientCount/1000000).toFixed(2)}M مستخدم`, icon: User, color: "text-blue-600" },
    { name: "بوابة المنشآت", status: "نشط", load: "3.1K منشأة", icon: Building2, color: "text-emerald-600" },
    { name: "جسر الصحة (Health Bridge)", status: "نشط", load: "850 req/s", icon: Activity, color: "text-indigo-600" },
    { name: "المساعد الطبي الذكي", status: "نشط", load: "15K تحليل/يوم", icon: TrendingUp, color: "text-purple-600" },
    { name: "مستودع البيانات الوطني", status: "مزامنة", load: "45 TB", icon: LayoutDashboard, color: "text-amber-600" },
  ];

  const handleLogout = async () => {
    navigate("/auth");
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="gov-card p-6 flex items-center gap-5"
              >
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-500 text-xs font-bold">{stat.label}</p>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="gov-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-display">اتجاهات الأوبئة</h2>
                  <p className="text-xs text-slate-500 mt-1">مقارنة الحالات المسجلة شهرياً</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <Filter size={20} />
                </button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={diseaseTrends}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="cases" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="gov-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-display">الضغط على المستشفيات</h2>
                  <p className="text-xs text-slate-500 mt-1">نسبة إشغال الأسرة حسب المحافظة</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <Download size={20} />
                </button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalLoad}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="load" radius={[6, 6, 0, 0]}>
                      {hospitalLoad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.load > 85 ? '#e11d48' : '#2563eb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* System Health Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 font-display">حالة المنظومة الوطنية (NDHS)</h2>
              <button className="text-sm font-black text-gov-blue hover:underline">عرض التقارير الفنية</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {systemComponents.map((comp, idx) => (
                <div key={idx} className="gov-card p-6 flex flex-col items-center text-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 ${comp.color} flex items-center justify-center`}>
                    <comp.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{comp.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{comp.load}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black">{comp.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Regional Nodes Status */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 font-display">حالة العقد الإقليمية</h2>
              <button className="text-sm font-black text-gov-blue hover:underline">إدارة الشبكة</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {regionalNodes.map((node, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="gov-card p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-3 rounded-full ${node.color} animate-pulse`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.status}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{node.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{node.type}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-slate-500">الضغط</span>
                      <span className="text-[10px] font-black text-slate-900">{node.load}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${node.color}`} 
                        style={{ width: node.load }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Alerts Section */}
          <section className="gov-card p-8 bg-rose-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-right">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white font-display">تنبيهات الطوارئ الوطنية</h2>
                  <p className="text-rose-100 font-medium mt-1">تم رصد ارتفاع غير طبيعي في حالات الكوليرا في محافظة الحديدة</p>
                </div>
              </div>
              <button className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black shadow-xl hover:bg-rose-50 transition-all">
                تفعيل خطة الاستجابة
              </button>
            </div>
          </section>
        </div>
    );
};

export default GovernmentDashboard;
