import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Stethoscope, 
  AlertCircle,
  BrainCircuit,
  Microscope,
  Info,
  ShieldCheck
} from "lucide-react";

const AIDiagnosis: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "أنت مساعد طبي ذكي في نظام الصحة الرقمي الوطني لليمن. قدم نصائح طبية أولية بناءً على الأعراض المذكورة، مع التأكيد دائماً على ضرورة مراجعة الطبيب المختص. استخدم لغة عربية مهنية وودودة. ركز على الإرشادات الوقائية والتشخيص الأولي المحتمل بناءً على المعايير الطبية العالمية."
        }
      });

      setMessages(prev => [...prev, { role: "ai", content: response.text || "عذراً، لم أتمكن من معالجة طلبك حالياً." }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: "ai", content: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي الطبي." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col p-6 space-y-6" dir="rtl">
      {/* AI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-xl shadow-indigo-900/20">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white font-display">المساعد الطبي الذكي</h1>
            <p className="text-slate-400 font-medium mt-1">تقنيات الذكاء الاصطناعي لدعم التشخيص الأولي</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-2xl font-bold border border-emerald-500/20">
          <Microscope size={20} />
          نظام تحليل متقدم
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 text-amber-400 text-xs font-bold">
          <AlertCircle size={16} />
          تنبيه: هذا المساعد يوفر إرشادات أولية فقط ولا يغني عن استشارة الطبيب المختص في المنشآت الصحية المعتمدة.
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-600/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20 animate-bounce">
                <Bot size={48} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-black text-white font-display">كيف يمكنني مساعدتك اليوم؟</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  يمكنك وصـف الأعراض التي تشعر بها، أو الاستفسار عن إرشادات وقائية معينة، وسأقوم بتحليلها بناءً على البروتوكولات الطبية الوطنية.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <button onClick={() => setInput("أشعر بصداع مستمر مع زغللة في العين")} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all text-right">
                  "أشعر بصداع مستمر مع زغللة في العين"
                </button>
                <button onClick={() => setInput("ما هي أعراض حمى الضنك وكيفية الوقاية منها؟")} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all text-right">
                  "ما هي أعراض حمى الضنك وكيفية الوقاية منها؟"
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/10 text-indigo-400 border-white/20'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed font-medium ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-indigo-400 border border-white/20 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-white/5 text-slate-400 p-5 rounded-3xl rounded-tl-none border border-white/10 flex items-center gap-3">
                <Loader2 className="animate-spin" size={16} />
                جاري تحليل البيانات الطبية...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="relative">
            <input 
              type="text"
              placeholder="اكتب استفسارك الطبي هنا..."
              className="w-full pr-6 pl-16 py-5 bg-slate-900 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Stethoscope size={10} />
              مدعوم بالذكاء الاصطناعي
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} />
              بيانات مشفرة وآمنة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosis;
