import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Smartphone, 
  Key, 
  Loader2, 
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";

import { authService } from "../services/authService";

const PersonalAuth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState<"otp" | "google">("otp");

  // Form states
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // For Zero Trust demo, we'll use a fixed email that we auto-provisioned
      await authService.login('qazxswedc7144@gmail.com', 'password123', 'Google Chrome (Macintosh)');
      navigate("/home");
    } catch (err: any) {
      setError("فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (nationalId.length < 11) {
        setError("يرجى إدخال رقم وطني صحيح (11 رقم)");
        return;
      }
      if (phone.length < 9) {
        setError("يرجى إدخال رقم هاتف صحيح");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 1000);
      return;
    }

    if (!otp || otp.length < 6) {
      setError("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      // For Zero Trust demo, we'll use a fixed email that we auto-provisioned
      // In a real app, this would be based on the nationalId/phone
      await authService.login('qazxswedc7144@gmail.com', 'password123', 'Mobile App (iOS)');
      navigate("/home");
    } catch (err: any) {
      setError("فشل التحقق من الرمز. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
      {/* Left Side - Info (Blue Theme) */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xl">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">النظام الصحي الوطني</h1>
              <p className="text-[10px] text-blue-100 mt-1 font-bold uppercase tracking-wider">National Digital Health System</p>
            </div>
          </div>
          
          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight">تسجيل دخول الأفراد</h2>
            <p className="text-blue-100 text-lg font-medium leading-relaxed">
              الوصول الآمن لسجلك الصحي الموحد، الوصفات الطبية، ونتائج الفحوصات في أي وقت ومن أي مكان.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/60 text-sm font-bold">
          <ShieldCheck size={20} />
          نظام مشفر ومحمي وفق المعايير الوطنية
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col p-6 md:p-12 justify-center items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate("/")}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
            >
              <ArrowRight size={16} />
              الرجوع للرئيسية
            </button>
          </div>

          <div className="text-center md:text-right space-y-2">
            <h2 className="text-3xl font-black text-slate-900">تسجيل دخول الأفراد</h2>
            <p className="text-slate-500 font-medium">أدخل بياناتك للوصول إلى حسابك الشخصي</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { setLoginMethod("otp"); setStep(1); }}
              className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                loginMethod === "otp" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              رقم الهوية + الهاتف
            </button>
            <button 
              onClick={() => setLoginMethod("google")}
              className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                loginMethod === "google" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              حساب Google
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === "google" ? (
              <motion.div
                key="google"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 text-center">
                  <Globe className="text-blue-600" size={48} />
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900">تسجيل دخول آمن</h3>
                    <p className="text-xs text-slate-500 font-medium">استخدم حساب جوجل الخاص بك للوصول السريع</p>
                  </div>
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        المتابعة باستخدام Google
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 mr-2">الرقم الوطني</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          type="text"
                          maxLength={11}
                          placeholder="00000000000"
                          className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 mr-2">رقم الهاتف</label>
                      <div className="relative">
                        <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          type="tel"
                          placeholder="7XXXXXXXX"
                          className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-600 text-sm font-bold">
                      <Smartphone size={18} />
                      تم إرسال رمز التحقق إلى {phone}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 mr-2">رمز التحقق (OTP)</label>
                      <div className="relative">
                        <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 text-center tracking-[1em] font-black focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-blue-600 hover:underline">تغيير رقم الهاتف؟</button>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (step === 1 ? "متابعة" : "تأكيد الدخول")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PersonalAuth;
