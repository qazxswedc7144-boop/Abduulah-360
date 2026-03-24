import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Server, 
  Activity, 
  Database, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  AlertTriangle,
  MapPin,
  Cpu,
  Network
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  role: string;
  status: string;
  load: number;
  latency: string;
}

const Infrastructure: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const fetchInfra = async () => {
      const res = await fetch("/api/infrastructure/regions");
      setRegions(await res.json());
      setLoading(false);
    };
    fetchInfra();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
    }, 2000);
  };

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* Infrastructure Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display">البنية التحتية الموزعة</h1>
          <p className="text-slate-400 font-medium mt-1">إدارة العقد الإقليمية ومراكز البيانات الموزعة</p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
          مزامنة العقد الوطنية
        </button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold">تكامل البيانات</p>
            <h3 className="text-2xl font-black text-white">99.9%</h3>
            <p className="text-[10px] text-emerald-400 font-black mt-1 uppercase tracking-widest">مؤمن بالكامل</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <Cpu size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold">المعالجة الموزعة</p>
            <h3 className="text-2xl font-black text-white">7/7 عُقد</h3>
            <p className="text-[10px] text-indigo-400 font-black mt-1 uppercase tracking-widest">تعمل بكفاءة</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <Network size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold">آخر مزامنة شاملة</p>
            <h3 className="text-2xl font-black text-white">{lastSync}</h3>
            <p className="text-[10px] text-blue-400 font-black mt-1 uppercase tracking-widest">تلقائي كل 5 دقائق</p>
          </div>
        </motion.div>
      </div>

      {/* Regional Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="animate-spin mb-4" size={40} />
            <p className="font-bold">جاري فحص العقد الإقليمية...</p>
          </div>
        ) : regions.map((region, index) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 space-y-6 relative group overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${
              region.id === 'sanaa' ? 'bg-indigo-500' : region.id === 'aden' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}></div>

            <div className="flex justify-between items-start relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                region.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <Server size={24} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${region.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{region.status}</span>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-black text-white font-display">{region.name}</h3>
              <p className="text-slate-400 text-xs font-bold mt-1">{region.role}</p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">حمل المعالجة</span>
                  <span className="text-white">{region.load}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${region.load}%` }}
                    className={`h-full rounded-full ${
                      region.load > 70 ? 'bg-rose-500' : region.load > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold mb-1">الاستجابة</p>
                  <div className="flex items-center gap-2 text-white font-black">
                    <Activity size={12} className="text-indigo-400" />
                    {region.latency}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold mb-1">التوافر</p>
                  <div className="flex items-center gap-2 text-white font-black">
                    <Wifi size={12} className="text-emerald-400" />
                    99.9%
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <MapPin size={10} />
                مركز بيانات محلي
              </div>
              <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Offline Fallback Simulation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 bg-amber-500/5 border-amber-500/20"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center shrink-0 border border-amber-500/20">
            <WifiOff size={40} />
          </div>
          <div className="space-y-4 text-center md:text-right">
            <h2 className="text-2xl font-black text-white font-display">نظام العمل دون اتصال (Offline Mode)</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              تعتمد البنية التحتية الوطنية على تقنية "المزامنة المؤجلة". في حال انقطاع الإنترنت عن أي عقدة إقليمية، يستمر النظام في العمل محلياً ويقوم بمزامنة كافة البيانات تلقائياً فور عودة الاتصال، مع ضمان عدم تضارب البيانات باستخدام التوقيت الزمني الموحد.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black border border-amber-500/20">
                تخزين محلي مشفر
              </div>
              <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black border border-amber-500/20">
                مزامنة ذكية
              </div>
              <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black border border-amber-500/20">
                حل النزاعات تلقائياً
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Infrastructure;
