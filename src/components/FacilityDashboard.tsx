import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  UserPlus, 
  ClipboardList, 
  FlaskConical, 
  Pill, 
  Radio, 
  Users, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  ChevronLeft, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  Share2,
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../services/mockDataService";

const FacilityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("nationalId");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      const results = mockDataService.searchPatients(searchTerm, searchType);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const quickActions = [
    { label: "فتح سجل طبي", icon: ClipboardList, color: "bg-indigo-600", path: "/patients" },
    { label: "إنشاء وصفة", icon: Pill, color: "bg-rose-600", path: "/create-prescription" },
    { label: "رفع نتائج مختبر", icon: FlaskConical, color: "bg-amber-600", path: "/labs" },
    { label: "رفع صور أشعة", icon: Radio, color: "bg-purple-600", path: "/radiology" },
    { label: "إدارة الكادر", icon: Users, color: "bg-emerald-600", path: "/doctors" },
    { label: "المواعيد اليوم", icon: Calendar, color: "bg-sky-600", path: "/appointments" },
  ];

  return (
    <div className="space-y-10" dir="rtl">
      {/* Global Search Section */}
        <section className="gov-card p-8 bg-gov-blue relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="text-center md:text-right">
              <h2 className="text-2xl font-black text-white font-display">البحث السريع عن مريض</h2>
              <p className="text-blue-100 font-medium">يمكنك البحث باستخدام الرقم الوطني، الاسم، أو رقم الهاتف</p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="أدخل بيانات البحث هنا..."
                  className="w-full pr-12 pl-4 py-4 bg-white border-transparent rounded-2xl focus:ring-4 focus:ring-white/20 transition-all font-bold text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-6 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-sm appearance-none cursor-pointer hover:bg-white/20 transition-all"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="nationalId" className="text-slate-900">الرقم الوطني</option>
                <option value="yhid" className="text-slate-900">معرف YHID</option>
                <option value="name" className="text-slate-900">الاسم الكامل</option>
                <option value="phone" className="text-slate-900">رقم الهاتف</option>
              </select>
              <button 
                type="submit"
                disabled={isSearching}
                className="px-10 py-4 bg-white text-gov-blue font-black rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-blue-900/20 disabled:opacity-50"
              >
                {isSearching ? "جاري البحث..." : "بحث"}
              </button>
              <button 
                type="button"
                onClick={() => alert("جاري تشغيل الكاميرا لمسح رمز YHID...")}
                className="px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-900/20 flex items-center gap-2"
              >
                <ShieldCheck size={20} />
                مسح YHID
              </button>
            </form>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                >
                  {searchResults.map((result) => (
                    <div 
                      key={result.id}
                      onClick={() => navigate(`/patient/${result.id}`)}
                      className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white text-gov-blue rounded-xl flex items-center justify-center shadow-lg">
                          <Users size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-white">{result.name}</h4>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-[10px] text-blue-100 font-bold">YHID: {result.yhid}</p>
                            <p className="text-[10px] text-blue-100/70 font-bold">الرقم الوطني: {result.nationalId}</p>
                          </div>
                        </div>
                      </div>
                      <ChevronLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 font-display">الإجراءات السريعة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => navigate(action.path)}
                className="gov-card p-6 flex flex-col items-center gap-4 text-center group"
              >
                <div className={`w-14 h-14 ${action.color} text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl`}>
                  <action.icon size={28} />
                </div>
                <span className="text-sm font-black text-slate-700">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Bottom Section: Stats & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Appointments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 font-display">مواعيد اليوم</h2>
              <button className="text-sm font-black text-gov-blue hover:underline">عرض الجدول الكامل</button>
            </div>
            <div className="gov-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[
                  { patient: "أحمد محمد علي", time: "09:00 ص", type: "فحص دوري", doctor: "د. خالد العبسي" },
                  { patient: "سارة عبدالله", time: "10:30 ص", type: "متابعة سكري", doctor: "د. سارة اليافعي" },
                  { patient: "يحيى صالح", time: "11:45 ص", type: "استشارة جراحية", doctor: "د. أحمد القدسي" },
                ].map((apt, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-gov-blue group-hover:text-white transition-all">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{apt.patient}</h4>
                        <p className="text-xs text-slate-500 mt-1">{apt.type} - {apt.doctor}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-gov-blue">{apt.time}</p>
                      <button className="text-[10px] font-black text-slate-400 hover:text-gov-blue transition-colors mt-1">بدء المعاينة</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Facility Stats */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 font-display">إحصائيات المنشأة</h2>
              <div className="gov-card p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-500">إشغال الأسرة</span>
                    <span className="text-gov-blue">85%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-gov-blue" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-500">مخزون الأدوية الأساسية</span>
                    <span className="text-gov-green">92%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-gov-green" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase">الأطباء المناوبون</p>
                    <h4 className="text-xl font-black text-slate-900">12</h4>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase">حالات الطوارئ</p>
                    <h4 className="text-xl font-black text-rose-600">3</h4>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 font-display">تنبيهات المنشأة</h2>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertCircle size={20} />
                  <h3 className="font-black text-sm">نقص في مخزون الأنسولين</h3>
                </div>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  يرجى مراجعة قسم التموين الطبي لطلب كميات إضافية. المخزون الحالي يكفي لـ 48 ساعة فقط.
                </p>
                <button className="text-[10px] font-black text-amber-600 hover:underline">طلب توريد</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
};

export default FacilityDashboard;
