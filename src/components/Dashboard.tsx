import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  Pill, 
  Activity, 
  IdCard, 
  ClipboardList, 
  FlaskConical, 
  Radio, 
  Syringe, 
  Clock, 
  AlertCircle, 
  MapPin, 
  ChevronLeft,
  LayoutDashboard,
  Building2,
  Bot,
  QrCode
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../services/mockDataService";

interface DashboardProps {
  role: string | null;
}

import { authService } from "../services/authService";

const Dashboard: React.FC<DashboardProps> = ({ role: propRole }) => {
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState<string>("0");
  const [prescriptionCount, setPrescriptionCount] = useState<string>("0");
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [isOnline] = useState(true);
  
  const user = authService.getUser();
  const role = user?.role || propRole;

  useEffect(() => {
    // Fetch stats from mock data service
    const patients = mockDataService.getPatients();
    const prescriptions = mockDataService.getPrescriptions();
    setPatientCount(patients.length.toLocaleString('ar-YE'));
    setPrescriptionCount(prescriptions.length.toLocaleString('ar-YE'));
    
    // For demo, assume first patient is the logged in user
    if (patients.length > 0) {
      setCurrentPatient(patients[0]);
    }
  }, []);

  const stats = [
    { label: "عدد المرضى", value: patientCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "زيارات اليوم", value: "٤٨", icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
    { label: "عدد الوصفات", value: prescriptionCount, icon: Pill, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "حالة النظام", value: isOnline ? "مستقر" : "أوفلاين", icon: Activity, color: isOnline ? "text-emerald-600" : "text-rose-600", bg: isOnline ? "bg-emerald-50" : "bg-rose-50" },
  ];

  const coreServices = [
    { label: "بطاقتي الصحية", icon: IdCard, path: "/health-card", color: "bg-emerald-600" },
    { label: "السجل الطبي", icon: ClipboardList, path: "/patients", color: "bg-indigo-600" },
    { label: "نتائج المختبر", icon: FlaskConical, path: "/labs", color: "bg-amber-600" },
    { label: "الوصفات الطبية", icon: Pill, path: "/prescriptions", color: "bg-rose-600" },
    { label: "صرف الوصفات", icon: QrCode, path: "/pharmacy/scan", color: "bg-slate-900" },
    { label: "الأشعة", icon: Radio, path: "/radiology", color: "bg-purple-600" },
    { label: "التطبيعات", icon: Syringe, path: "/vaccination", color: "bg-emerald-600" },
    { label: "المواعيد", icon: Calendar, path: "/appointments", color: "bg-sky-600" },
    { label: "الخريطة", icon: MapPin, path: "/map", color: "bg-blue-600" },
    { label: "المساعد الذكي", icon: Bot, path: "/ai", color: "bg-indigo-600" },
    ...(role === 'admin' || role === 'regional_admin' ? [{ label: "التحكم الوطني", icon: LayoutDashboard, path: "/dashboard", color: "bg-gov-blue" }] : []),
  ];

  const recentActivities = [
    { title: "تم إصدار وصفة طبية جديدة", time: "منذ 10 دقائق", type: "prescription" },
    { title: "تم تحديث السجل الطبي للمريض #4521", time: "منذ ساعة", type: "record" },
    { title: "نتيجة مختبر جديدة متاحة", time: "منذ ساعتين", type: "lab" },
    { title: "تم حجز موعد جديد في عيادة الباطنية", time: "منذ 3 ساعات", type: "appointment" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome & YHID Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">مرحباً بك في النظام الصحي الوطني</h1>
          <p className="text-emerald-50 font-medium opacity-90">الوصول الموحد للخدمات الصحية الرقمية في الجمهورية اليمنية</p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <IdCard size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">رقم هويتك الصحية (YHID)</p>
            <p className="text-lg font-mono font-black tracking-wider">{currentPatient?.yhid || "YHID-2026-000123"}</p>
          </div>
        </div>
      </div>

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
              <p className="text-slate-500 text-sm font-bold">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Core Services Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 font-display">الخدمات الأساسية</h2>
          <button className="text-sm font-black text-gov-blue hover:underline">عرض الكل</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {coreServices.map((service, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -5 }}
              onClick={() => navigate(service.path)}
              className="gov-card p-6 flex flex-col items-center gap-4 text-center group"
            >
              <div className={`w-12 h-12 ${service.color} text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                <service.icon size={24} />
              </div>
              <span className="text-sm font-black text-slate-700">{service.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 font-display">النشاطات الأخيرة</h2>
            <button className="text-sm font-black text-gov-blue hover:underline">سجل النشاط</button>
          </div>
          <div className="gov-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-gov-blue group-hover:text-white transition-all">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-gov-blue transition-all">
                    <ChevronLeft size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts & Facilities */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 font-display">تنبيهات صحية</h2>
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle size={20} />
                <h3 className="font-black text-sm">تنبيه وبائي: حمى الضنك</h3>
              </div>
              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                يرجى اتخاذ الإجراءات الوقائية اللازمة في المناطق المتضررة. تأكد من إفراغ حاويات المياه المكشوفة.
              </p>
              <button className="text-[10px] font-black text-rose-600 hover:underline">اقرأ المزيد</button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 font-display">أقرب منشأة صحية</h2>
            <div className="gov-card p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gov-green-light text-gov-green rounded-xl flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">مستشفى الثورة العام</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    على بعد 1.2 كم
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gov-green" />
                </div>
                <span className="text-[10px] font-black text-gov-green">متاح حالياً</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate("/map")}
                  className="flex-1 py-3 bg-gov-blue text-white rounded-xl text-xs font-black hover:bg-blue-800 transition-all"
                >
                  عرض الخريطة
                </button>
                <button className="flex-1 py-3 bg-gov-green-light text-gov-green rounded-xl text-xs font-black hover:bg-gov-green hover:text-white transition-all">
                  الاتجاهات
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
