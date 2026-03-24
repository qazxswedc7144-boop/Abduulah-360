import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, AlertCircle, Brain, ChevronLeft, Send, Sparkles, Stethoscope, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { medicalAnalysis } from "../services/geminiService";

const AIAnalysis: React.FC = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await medicalAnalysis(symptoms, []);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all">
        <ChevronLeft size={20} />
        العودة للوحة التحكم
      </Link>

      <div className="bg-indigo-600 p-12 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
            <Brain size={32} />
          </div>
          <h1 className="text-4xl font-bold">تحليل الذكاء الاصطناعي</h1>
          <p className="text-indigo-100 mt-4 text-lg leading-relaxed">
            استخدم قوة الذكاء الاصطناعي (Gemini) لتحليل الأعراض واكتشاف الأنماط الصحية وتنبيهات الأوبئة في منطقتك.
          </p>
        </div>
        <Sparkles className="absolute -right-12 -bottom-12 text-white/10" size={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAnalyze} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">صف الأعراض الحالية</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[200px] text-sm leading-relaxed"
                placeholder="مثال: أشعر بصداع شديد مع حمى وسعال جاف منذ يومين..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Send size={18} />
                  بدء التحليل الذكي
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 flex gap-4"
              >
                <AlertCircle size={24} />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope size={20} className="text-indigo-500" />
                      التحليل الأولي
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{result.analysis}</p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-4">
                      <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                        <TrendingUp size={18} />
                        الأنماط المكتشفة
                      </h3>
                      <p className="text-indigo-700 text-xs leading-relaxed">{result.patterns}</p>
                    </section>
                    <section className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100/50 space-y-4">
                      <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                        <AlertCircle size={18} />
                        تنبيهات الأوبئة
                      </h3>
                      <p className="text-rose-700 text-xs leading-relaxed">{result.alerts}</p>
                    </section>
                  </div>

                  <section className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <Activity size={18} />
                      التوصيات المقترحة
                    </h3>
                    <p className="text-emerald-700 text-xs leading-relaxed">{result.recommendations}</p>
                  </section>

                  <div className="p-4 bg-slate-50 rounded-xl text-[10px] text-slate-400 text-center italic">
                    تنبيه: هذا التحليل استرشادي فقط ولا يغني عن استشارة الطبيب المختص.
                  </div>
                </div>
              </motion.div>
            ) : !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <Brain size={64} className="opacity-20" />
                <p className="text-sm font-medium">أدخل الأعراض لبدء التحليل الذكي</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
