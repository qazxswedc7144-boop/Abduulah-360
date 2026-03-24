import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  User, 
  Key, 
  Loader2, 
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";

import { authService } from "../services/authService";

const FacilityAuth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"credentials" | "google">("credentials");

  // Form states
  const [licenseNumber, setLicenseNumber] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

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

    if (!licenseNumber || !adminId || !password) {
      setError("يرجى إدخال كافة البيانات المطلوبة");
      return;
    }

    setLoading(true);
    try {
      // For Zero Trust demo, we'll use a fixed email that we auto-provisioned
      await authService.login('qazxswedc7144@gmail.com', password, `Facility Admin (${licenseNumber})`);
      navigate("/home");
    } catch (err: any) {
      setError("فشل التحقق من بيانات المنشأة. يرجى التأكد من رقم الترخيص وكلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
      {/* Left Side - Info (Green Theme) */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-600 relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xl">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">النظام الصحي الوطني</h1>
              <p className="text-[10px] text-emerald-100 mt-1 font-bold uppercase tracking-wider">National Digital Health System</p>
            </div>
          </div>
          
          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight">تسجيل دخول المنشآت الصحية</h2>
            <p className="text-emerald-100 text-lg font-medium leading-relaxed">
              بوابة متكاملة للمستشفيات، العيادات، والمختبرات لإدارة بيانات المرضى وتقديم الرعاية الصحية الرقمية.
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
              className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-colors"
            >
              <ArrowRight size={16} />
              الرجوع للرئيسية
            </button>
          </div>

          <div className="text-center md:text-right space-y-2">
            <h2 className="text-3xl font-black text-slate-900">تسجيل دخول المنشآت</h2>
            <p className="text-slate-500 font-medium">أدخل بيانات المنشأة والمسؤول للمتابعة</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setLoginMethod("credentials")}
              className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                loginMethod === "credentials" ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              بيانات المنشأة
            </button>
            <button 
              onClick={() => setLoginMethod("google")}
              className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                loginMethod === "google" ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
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
                  <Globe className="text-emerald-600" size={48} />
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
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">رقم الترخيص</label>
                  <div className="relative">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      required
                      type="text"
                      placeholder="LIC-XXXXXX"
                      className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all outline-none"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">الرقم الوطني للمسؤول</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      required
                      type="text"
                      maxLength={11}
                      placeholder="00000000000"
                      className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all outline-none"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">كلمة المرور</label>
                  <div className="relative">
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-14 bg-slate-100 border-transparent rounded-2xl px-12 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : "تسجيل الدخول"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FacilityAuth;
