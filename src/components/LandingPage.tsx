import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Building2, ShieldCheck, Activity, Calendar } from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gov-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gov-blue leading-none">النظام الصحي الوطني الرقمي</h1>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">National Digital Health System (NDHS)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <a href="#about" className="hover:text-gov-blue transition-colors">عن المشروع</a>
            <a href="#components" className="hover:text-gov-blue transition-colors">مكونات النظام</a>
            <a href="#vision" className="hover:text-gov-blue transition-colors">الرؤية الوطنية</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gov-blue/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gov-green/5 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gov-blue-light text-gov-blue rounded-full text-sm font-black border border-gov-blue/10 mb-4">
            <ShieldCheck size={16} />
            نظام وطني آمن وموحد
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight font-display">
            النظام الصحي الوطني <br />
            <span className="text-gov-blue">للجمهورية اليمنية</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            منصة رقمية متكاملة تهدف إلى توفير سجل صحي موحد لكل مواطن، وتسهيل الوصول إلى الخدمات الطبية بجودة وكفاءة عالية.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login/personal")}
              className="p-8 bg-white border-2 border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4 hover:border-gov-blue transition-all group"
            >
              <div className="w-20 h-20 bg-gov-blue-light text-gov-blue rounded-3xl flex items-center justify-center group-hover:bg-gov-blue group-hover:text-white transition-all duration-500">
                <User size={40} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">حساب شخصي</h3>
                <p className="text-slate-500 font-medium mt-1">للمواطنين والمقيمين</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login/facility")}
              className="p-8 bg-white border-2 border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4 hover:border-gov-green transition-all group"
            >
              <div className="w-20 h-20 bg-gov-green-light text-gov-green rounded-3xl flex items-center justify-center group-hover:bg-gov-green group-hover:text-white transition-all duration-500">
                <Building2 size={40} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">منشأة صحية</h3>
                <p className="text-slate-500 font-medium mt-1">للمستشفيات والمراكز الطبية</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* System Components Section */}
        <section id="components" className="max-w-7xl w-full py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900 font-display">مكونات المنظومة الوطنية</h2>
            <p className="text-slate-500 font-medium">نظام متكامل يربط كافة أطراف الرعاية الصحية في الجمهورية</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "تطبيق المواطن", desc: "سجل صحي موحد وخدمات ذكية في متناول اليد", icon: User },
              { title: "بوابة المنشآت", icon: Building2, desc: "نظام إدارة متكامل للمستشفيات والمراكز" },
              { title: "المساعد الذكي", icon: Activity, desc: "تحليل طبي مدعوم بالذكاء الاصطناعي" },
              { title: "جسر الصحة", icon: ShieldCheck, desc: "تبادل البيانات الصحية بشكل آمن ولحظي" },
            ].map((comp, idx) => (
              <div key={idx} className="gov-card p-8 space-y-4 hover:border-gov-blue transition-all">
                <div className="w-12 h-12 bg-slate-100 text-gov-blue rounded-xl flex items-center justify-center">
                  <comp.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{comp.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{comp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Roadmap */}
        <section className="max-w-7xl w-full py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900 font-display">خطة التنفيذ الوطنية</h2>
            <p className="text-slate-500 font-medium">مراحل إطلاق المنظومة الرقمية الموحدة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { phase: "المرحلة الأولى", title: "الإطلاق التجريبي", desc: "بدء العمل في العاصمة صنعاء - المختبرات والعيادات الرئيسية", time: "3 أشهر" },
              { phase: "المرحلة الثانية", title: "التوسع الإقليمي", desc: "توسيع الربط ليشمل المدن الرئيسية (عدن، تعز، حضرموت)", time: "6 أشهر" },
              { phase: "المرحلة الثالثة", title: "الانتشار الوطني", desc: "تغطية شاملة لكافة محافظات الجمهورية والمنشآت الريفية", time: "12 شهر" },
            ].map((step, idx) => (
              <div key={idx} className="gov-card p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gov-blue opacity-20 group-hover:opacity-100 transition-all" />
                <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">{step.phase}</span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">{step.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-gov-blue font-black text-xs">
                  <Calendar size={14} />
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="max-w-7xl w-full py-24 bg-slate-100 rounded-[48px] p-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900 font-display">البنية التحتية التقنية</h2>
            <p className="text-slate-500 font-medium">نظام موزع ومؤمن بأحدث التقنيات العالمية</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "نظام موزع", desc: "عقد إقليمية في صنعاء، عدن، تعز، حضرموت لضمان استمرارية الخدمة" },
              { title: "أمن البيانات", desc: "تشفير كامل للبيانات (At Rest & In Transit) مع نظام تدقيق شامل" },
              { title: "الذكاء الاصطناعي", desc: "محرك تحليل مدمج لدعم التشخيص المبكر والرصد الوبائي" },
              { title: "التوافر العالي", desc: "بنية سحابية مرنة تدعم الملايين من المستخدمين والمنشآت" },
            ].map((tech, idx) => (
              <div key={idx} className="space-y-3">
                <div className="w-10 h-10 bg-gov-blue text-white rounded-lg flex items-center justify-center font-black">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-black text-slate-900">{tech.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Model */}
        <section className="max-w-7xl w-full py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900 font-display">نموذج الأمان والخصوصية</h2>
            <p className="text-slate-500 font-medium">حماية بيانات المواطن هي أولويتنا القصوى</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "التحكم بالوصول", desc: "نظام صلاحيات صارم (RBAC) يضمن وصول المخولين فقط للبيانات الحساسة" },
              { title: "تشفير البيانات", desc: "تشفير كافة السجلات الطبية والبيانات الشخصية بأعلى المعايير العالمية" },
              { title: "التحقق الثنائي", desc: "نظام التحقق عبر الرسائل النصية (OTP) لضمان هوية المستخدمين" },
            ].map((sec, idx) => (
              <div key={idx} className="gov-card p-8 border-t-4 border-gov-blue">
                <ShieldCheck className="text-gov-blue mb-4" size={32} />
                <h3 className="text-xl font-black text-slate-900">{sec.title}</h3>
                <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cost Optimization & Impact */}
        <section className="max-w-7xl w-full py-24 bg-gov-blue-light rounded-[48px] p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 font-display">تحسين التكاليف والأثر الاقتصادي</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              يعتمد النظام على تقنيات سحابية مرنة تسمح بالنمو التدريجي وتقليل التكاليف التشغيلية بنسبة تصل إلى 40% من خلال:
            </p>
            <ul className="space-y-4">
              {[
                "تقليل تكرار الفحوصات الطبية غير الضرورية",
                "أتمتة العمليات الإدارية في المنشآت الصحية",
                "تحسين دقة التشخيص وتقليل الأخطاء الطبية",
                "الاستجابة السريعة للأوبئة لتقليل الخسائر البشرية والمادية"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                  <div className="w-2 h-2 bg-gov-blue rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="gov-card p-6 text-center space-y-2">
              <h4 className="text-2xl font-black text-gov-blue">40%</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">وفر في التكاليف</p>
            </div>
            <div className="gov-card p-6 text-center space-y-2">
              <h4 className="text-2xl font-black text-emerald-600">60%</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">سرعة الاستجابة</p>
            </div>
            <div className="gov-card p-6 text-center space-y-2">
              <h4 className="text-2xl font-black text-amber-600">95%</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">دقة البيانات</p>
            </div>
            <div className="gov-card p-6 text-center space-y-2">
              <h4 className="text-2xl font-black text-indigo-600">100%</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">ربط وطني</p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section id="vision" className="max-w-7xl w-full py-24 bg-gov-blue rounded-[48px] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl font-black font-display">رؤيتنا الوطنية</h2>
            <p className="text-xl font-medium leading-relaxed text-blue-100">
              "توفير سجل صحي موحد وآمن لكل مواطن في الجمهورية اليمنية، وربط جميع المنشآت الصحية لرفع جودة الرعاية ودعم اتخاذ القرار المبني على البيانات."
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
              {[
                "ربط جميع المنشآت الصحية الوطنية",
                "تحسين جودة الرعاية الصحية للمواطن",
                "تقليل التكاليف التشغيلية والهدر",
                "دعم اتخاذ القرار الاستراتيجي"
              ].map((mission, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl text-right">
                  <ShieldCheck size={18} className="text-blue-200 shrink-0" />
                  <span className="text-sm font-bold">{mission}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div>
                <h4 className="text-3xl font-black">100%</h4>
                <p className="text-xs text-blue-200 mt-1 font-bold">تغطية وطنية</p>
              </div>
              <div>
                <h4 className="text-3xl font-black">24/7</h4>
                <p className="text-xs text-blue-200 mt-1 font-bold">توفر الخدمة</p>
              </div>
              <div>
                <h4 className="text-3xl font-black">صفر</h4>
                <p className="text-xs text-blue-200 mt-1 font-bold">فقدان للبيانات</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-bold">© 2026 وزارة الصحة العامة والسكان - الجمهورية اليمنية</p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-gov-blue transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-gov-blue transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-gov-blue transition-colors">الدعم الفني</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
