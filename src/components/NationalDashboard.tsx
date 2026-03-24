import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Users, 
  Database, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Server,
  Globe,
  ShieldCheck
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const NationalDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [infra, setInfra] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, infraRes] = await Promise.all([
        fetch("/api/analytics/national"),
        fetch("/api/infrastructure/health")
      ]);
      setStats(await statsRes.json());
      setInfra(await infraRes.json());
    };
    fetchData();
  }, []);

  if (!stats || !infra) return <div className="p-8 text-white">Loading National Infrastructure...</div>;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* Infrastructure Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold">حالة النظام</p>
            <h3 className="text-xl font-black text-white">{infra.status}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
            <Server size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold">العقد النشطة</p>
            <h3 className="text-xl font-black text-white">{infra.activeNodes} / 7</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold">وقت التشغيل</p>
            <h3 className="text-xl font-black text-white">{infra.uptime}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold">الحمل الحالي</p>
            <h3 className="text-xl font-black text-white">{infra.currentLoad}</h3>
          </div>
        </motion.div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* National Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-8 space-y-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white font-display">توزيع المرضى حسب المحافظات</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <TrendingUp size={16} />
              +12% نمو شهري
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.regionalDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="patients" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disease Spread */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          <h2 className="text-xl font-black text-white font-display">رصد الأوبئة والانتشار</h2>
          <div className="space-y-4">
            {stats.diseaseSpread.map((disease: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${disease.trend === 'up' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <span className="font-bold text-slate-200">{disease.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{disease.cases.toLocaleString()} حالة</p>
                  <p className={`text-[10px] font-bold ${disease.trend === 'up' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {disease.trend === 'up' ? 'تصاعدي' : 'تنازلي'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Population Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-black text-white font-display mb-6">تغطية الهوية الرقمية الوطنية</h2>
          <div className="flex items-center gap-8">
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: stats.activeHealthIDs },
                      { name: 'Inactive', value: stats.totalCitizens - stats.activeHealthIDs }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#ffffff10" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm font-bold">إجمالي السكان</p>
                <h3 className="text-3xl font-black text-white">{(stats.totalCitizens / 1000000).toFixed(1)}M</h3>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold">الهويات النشطة</p>
                <h3 className="text-3xl font-black text-indigo-400">{(stats.activeHealthIDs / 1000000).toFixed(1)}M</h3>
              </div>
              <div className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-black text-center">
                تغطية بنسبة {((stats.activeHealthIDs / stats.totalCitizens) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 flex flex-col justify-center items-center text-center space-y-6"
        >
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-display">تنبيهات الطوارئ الوطنية</h2>
            <p className="text-slate-400 font-medium mt-2">لا توجد تهديدات وبائية نشطة حالياً. النظام في حالة تأهب قصوى.</p>
          </div>
          <button className="px-8 py-4 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-2xl font-black hover:bg-rose-600/30 transition-all">
            عرض بروتوكولات الاستجابة
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NationalDashboard;
