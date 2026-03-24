import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Pill, 
  Calendar, 
  User, 
  Stethoscope, 
  ChevronLeft, 
  CheckCircle, 
  Download,
  Printer,
  QrCode
} from "lucide-react";
import { mockDataService } from "../services/mockDataService";

const PrescriptionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>("admin"); // Mock role

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const presData = await mockDataService.getPrescriptionById(id);
        if (presData) {
          setPrescription(presData);

          const patients = await mockDataService.getPatients();
          const p = patients.find(pat => pat.id === presData.patientId);
          if (p) setPatient(p);

          const doctors = await mockDataService.getDoctors();
          const d = doctors.find(doc => doc.id === presData.doctorId);
          if (d) setDoctor(d);
        }
      } catch (error) {
        console.error("Error fetching prescription data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDispense = async () => {
    if (!id) return;
    try {
      await mockDataService.updatePrescription(id, { status: "dispensed" });
      setPrescription({ ...prescription, status: "dispensed" });
    } catch (error) {
      console.error("Error dispensing prescription:", error);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري تحميل الوصفة الطبية...</div>;
  if (!prescription) return <div className="p-8 text-center">الوصفة غير موجودة.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-700 to-blue-800 text-white pt-12 pb-24 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to={`/patient/${prescription.patientId}`} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">الوصفة الطبية الإلكترونية</h1>
              <p className="text-indigo-100/80 font-medium mt-1">نظام الوصفات الموحد - وزارة الصحة</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 ${
            prescription.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {prescription.status === 'pending' ? 'قيد الانتظار' : 'تم الصرف بنجاح'}
            {prescription.status !== 'pending' && <CheckCircle size={20} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Details Section */}
            <div className="space-y-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">المريض</p>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{patient?.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">الرقم الوطني: {patient?.nationalId}</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Stethoscope size={16} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">الطبيب المعالج</p>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">د. {doctor?.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{doctor?.specialty}</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">تاريخ الإصدار</p>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{prescription.date instanceof Date ? prescription.date.toLocaleDateString('ar-YE') : 'اليوم'}</h4>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Pill size={20} />
                  </div>
                  الأدوية الموصوفة
                </h3>
                <div className="space-y-4">
                  {prescription.medications.map((med: any, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all"
                    >
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Pill size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{med.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{med.dosage} • {med.frequency}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR & Action Section */}
            <div className="flex flex-col items-center justify-center space-y-10 md:border-r md:border-slate-100 md:pr-12">
              <div className="p-8 bg-white border-8 border-slate-50 rounded-[48px] shadow-xl shadow-slate-200/50 relative group">
                <div className="absolute inset-0 bg-indigo-600/5 rounded-[48px] opacity-0 group-hover:opacity-100 transition-all" />
                <img src={prescription.qrCode} alt="QR Code" className="w-56 h-56 relative z-10" />
                <div className="mt-6 text-center relative z-10">
                  <p className="text-sm font-black text-slate-900 flex items-center justify-center gap-2">
                    <QrCode size={18} className="text-indigo-600" />
                    كود التحقق الرقمي
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">امسح الكود في أي صيدلية معتمدة</p>
                </div>
              </div>

              <div className="w-full space-y-4">
                {role === 'pharmacy' && prescription.status === 'pending' && (
                  <button
                    onClick={handleDispense}
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <CheckCircle size={24} />
                    تأكيد صرف الدواء
                  </button>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Download size={20} />
                    تحميل PDF
                  </button>
                  <button className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Printer size={20} />
                    طباعة
                  </button>
                </div>
              </div>

              <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 w-full">
                <p className="text-xs text-indigo-700 font-bold leading-relaxed text-center">
                  هذه الوصفة الطبية صادرة إلكترونياً ومعتمدة من وزارة الصحة العامة والسكان. يرجى التأكد من صرف الدواء من صيدلية مرخصة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
