import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Fingerprint, 
  Activity, 
  ClipboardList, 
  FlaskConical, 
  Radio, 
  Syringe, 
  Pill, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Download,
  Printer,
  Share2,
  Plus,
  IdCard
} from "lucide-react";
import { mockDataService } from "../services/mockDataService";

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;

      try {
        const mockPatient = await mockDataService.getPatientById(id);
        
        if (!mockPatient) {
          navigate('/patients');
          return;
        }

        // Adapt the structure for the profile view
        const fullPatientData = {
          ...mockPatient,
          fullName: mockPatient.name,
          healthId: mockPatient.yhid,
          dateOfBirth: mockPatient.birthDate || mockPatient.age + " years",
          chronicDiseases: (mockPatient as any).chronicDiseases || ["السكري النوع الثاني"],
          allergies: (mockPatient as any).allergies || ["البنسلين"],
          records: (mockPatient as any).records || [
            { id: "r1", date: "2026-03-15", facility: "مستشفى الثورة", doctor: "د. خالد العبسي", diagnosis: "التهاب رئوي حاد", status: "مستقر" },
          ],
          prescriptions: (mockPatient as any).prescriptions || [
            { id: "RX-9283", date: "2026-03-15", doctor: "د. خالد العبسي", medicines: ["Amoxicillin 500mg"] },
          ],
          labs: (mockPatient as any).labs || [
            { id: "LAB-123", date: "2026-03-16", test: "CBC, CRP", status: "مكتمل" },
          ],
          radiology: (mockPatient as any).radiology || [
            { id: "RAD-456", date: "2026-03-15", type: "X-Ray Chest", status: "مكتمل" },
          ]
        };

        setPatient(fullPatientData);
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  const tabs = [
    { id: "info", label: "المعلومات الشخصية", icon: User },
    { id: "history", label: "التاريخ المرضي", icon: ClipboardList },
    { id: "prescriptions", label: "الوصفات", icon: Pill },
    { id: "labs", label: "التحاليل", icon: FlaskConical },
    { id: "radiology", label: "الأشعة", icon: Radio },
  ];

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-black text-slate-500">جاري تحميل الملف الصحي...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Profile Header Section */}
      <div className="bg-gov-blue text-white pt-8 pb-24 px-6 relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-gov-green rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[40px] border-4 border-white/20 flex items-center justify-center text-white shadow-2xl">
              <User size={64} />
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-4xl font-black font-display">{patient.fullName}</h1>
                <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full border border-white/20 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  هوية موثقة
                </div>
              </div>
              <p className="text-blue-100 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                <IdCard size={20} />
                المعرف الصحي: {patient.healthId}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-blue-100/80">
                <span className="flex items-center gap-1"><Calendar size={14} /> {patient.dateOfBirth}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {patient.address}</span>
              </div>
            </div>
            
            <div className="md:mr-auto flex items-center gap-3">
              <button 
                onClick={() => navigate('/health-card')}
                className="px-6 py-3 bg-white text-gov-blue font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
              >
                <IdCard size={20} />
                عرض البطاقة
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10" title="تحميل الملف">
                <Download size={20} />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10" title="طباعة">
                <Printer size={20} />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10" title="مشاركة">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-80 space-y-4">
            <div className="gov-card p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-4 py-4 rounded-xl font-black text-sm flex items-center gap-3 transition-all ${
                    activeTab === tab.id 
                      ? "bg-gov-blue text-white shadow-lg shadow-blue-900/20" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Alerts */}
            <div className="gov-card p-6 space-y-4">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-500" />
                تنبيهات طبية هامة
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">
                  حساسية من البنسلين
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-700">
                  مريض سكري - يحتاج متابعة دورية
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="gov-card p-8 min-h-[600px]"
              >
                {activeTab === "info" && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-blue pr-4">البيانات الشخصية</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {[
                            { label: "الاسم الكامل", value: patient.fullName },
                            { label: "الرقم الوطني", value: patient.nationalId },
                            { label: "تاريخ الميلاد", value: patient.dateOfBirth },
                            { label: "الجنس", value: patient.gender },
                            { label: "فصيلة الدم", value: patient.bloodType, highlight: true },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                              <span className="text-sm font-bold text-slate-500">{item.label}</span>
                              <span className={`text-sm font-black ${item.highlight ? "text-rose-600" : "text-slate-900"}`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-green pr-4">معلومات الطوارئ</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <span className="text-sm font-bold text-slate-500">جهة الاتصال في الطوارئ</span>
                            <p className="text-sm font-black text-slate-900">{patient.emergencyContact}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <span className="text-sm font-bold text-slate-500">الأمراض المزمنة</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {patient.chronicDiseases.map((d: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">{d}</span>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <span className="text-sm font-bold text-slate-500">الحساسية</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {patient.allergies.map((a: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black">{a}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-blue pr-4">سجل الزيارات الطبية</h3>
                      <button className="gov-button-primary py-2 text-xs">
                        <Plus size={16} />
                        إضافة زيارة
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {patient.records.map((record: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-gov-blue transition-all group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gov-blue shadow-sm">
                                <ClipboardList size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900">{record.diagnosis}</h4>
                                <p className="text-xs text-slate-500 font-bold mt-1">{record.facility} - {record.doctor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-left md:text-right">
                                <p className="text-xs font-black text-slate-900">{record.date}</p>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{record.status}</span>
                              </div>
                              <button className="p-2 hover:bg-white rounded-lg text-slate-400 group-hover:text-gov-blue transition-all">
                                <ChevronRight size={20} className="rotate-180" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "prescriptions" && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-blue pr-4">الوصفات الطبية النشطة والسابقة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {patient.prescriptions.map((rx: any, idx: number) => (
                        <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-1 h-full bg-gov-blue" />
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الوصفة</p>
                              <h4 className="text-lg font-black text-gov-blue">{rx.id}</h4>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-900">{rx.date}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{rx.doctor}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {rx.medicines.map((med: string, i: number) => (
                              <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-gov-blue" />
                                {med}
                              </div>
                            ))}
                          </div>
                          <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-gov-blue hover:text-white transition-all flex items-center justify-center gap-2">
                            <Printer size={14} />
                            طباعة الوصفة
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "labs" && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-blue pr-4">نتائج المختبر</h3>
                    <div className="gov-card overflow-hidden">
                      <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-500">رقم الفحص</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500">نوع الفحص</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500">التاريخ</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500">الحالة</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {patient.labs.map((lab: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-black text-gov-blue">{lab.id}</td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-700">{lab.test}</td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-500">{lab.date}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
                                  {lab.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button className="text-gov-blue hover:underline text-xs font-black">عرض النتيجة</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "radiology" && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 border-r-4 border-gov-blue pr-4">سجل الأشعة والتحاليل التصويرية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {patient.radiology.map((rad: any, idx: number) => (
                        <div key={idx} className="gov-card p-6 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                              <Radio size={28} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">{rad.type}</h4>
                              <p className="text-xs text-slate-500 font-bold mt-1">{rad.date}</p>
                            </div>
                          </div>
                          <button className="gov-button-secondary py-2 px-4 text-xs">
                            تحميل الصور
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
