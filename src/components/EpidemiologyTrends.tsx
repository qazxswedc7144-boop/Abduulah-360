import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  ChevronLeft,
  MapPin,
  RefreshCw,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  Legend
} from "recharts";
import { analyzeEpidemiology } from "../services/geminiService";

const COLORS = ['#0d9488', '#0891b2', '#4f46e5', '#e11d48', '#d97706'];

const EpidemiologyTrends: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/epidemiology/data");
      const result = await response.json();
      setData(result);
      
      // Analyze with AI
      setAnalyzing(true);
      const aiReport = await analyzeEpidemiology(result);
      setReport(aiReport);
    } catch (error) {
      console.error("Error fetching epidemiology data:", error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 font-medium">جاري تحليل البيانات الوبائية الوطنية...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all mb-2">
            <ChevronLeft size={20} />
            العودة للوحة التحكم
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="text-teal-600" size={32} />
            رصد الاتجاهات الوبائية
          </h1>
          <p className="text-slate-500">تحليل مدعوم بالذكاء الاصطناعي للبيانات الصحية الوطنية في اليمن</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={20} className={analyzing ? "animate-spin" : ""} />
          تحديث التحليل
        </button>
      </div>

      {analyzing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 text-indigo-700"
        >
          <Activity size={20} className="animate-pulse" />
          <p className="text-sm font-medium">يقوم الذكاء الاصطناعي حالياً بمعالجة البيانات للكشف عن أي أنماط تفشي محتملة...</p>
        </motion.div>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary & Risk Levels */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">ملخص الوضع الوبائي</h2>
              <p className="text-slate-600 leading-relaxed">{report.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {report.riskLevels.map((risk: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-900">{risk.disease}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        risk.risk === 'High' ? 'bg-rose-100 text-rose-600' : 
                        risk.risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {risk.risk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">{risk.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-teal-600" />
                  اتجاه الحالات (Trend)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.chartData.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Line type="monotone" dataKey="cases" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-600" />
                  التوزيع الجغرافي (Distribution)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.chartData.distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {report.chartData.distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Alerts & Recommendations */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle size={20} className="text-rose-600" />
                تنبيهات التفشي
              </h2>
              <div className="space-y-4">
                {report.outbreakAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border ${
                    alert.severity === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold ${alert.severity === 'High' ? 'text-rose-900' : 'text-amber-900'}`}>
                        {alert.disease} - {alert.region}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.severity === 'High' ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className={`text-xs ${alert.severity === 'High' ? 'text-rose-700' : 'text-amber-700'}`}>
                      {alert.description}
                    </p>
                  </div>
                ))}
                {report.outbreakAlerts.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ShieldCheck size={32} className="text-emerald-500 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-slate-500">لا توجد تنبيهات تفشي نشطة حالياً.</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-teal-600 p-6 rounded-3xl text-white shadow-xl shadow-teal-100"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={20} />
                توصيات وقائية
              </h2>
              <ul className="space-y-3">
                {report.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-teal-50 leading-tight">
                    <div className="w-1.5 h-1.5 bg-teal-300 rounded-full mt-1.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <Info size={16} />
                <span className="text-xs font-medium">حول هذا التحليل</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                يتم إنشاء هذا التقرير باستخدام نماذج الذكاء الاصطناعي المتقدمة (Gemini 3.1 Pro) التي تقوم بتحليل البيانات المجهولة المصدر للكشف عن الأنماط الوبائية. لا ينبغي استخدامه كبديل للتشخيص الطبي الرسمي أو قرارات الصحة العامة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpidemiologyTrends;
