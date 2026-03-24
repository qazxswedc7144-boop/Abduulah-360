import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockDataService';
import { 
  ArrowLeft, 
  Pill, 
  User, 
  Stethoscope, 
  Calendar, 
  Printer, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';

const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = mockDataService.getPrescriptionById(id);
      setPrescription(data);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-900">الوصفة غير موجودة</h2>
        <button 
          onClick={() => navigate('/prescriptions')}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          العودة لقائمة الوصفات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all font-bold"
        >
          <ArrowLeft size={20} />
          العودة
        </button>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={20} />
          </button>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Prescription Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-emerald-600 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center border border-white/30 shadow-inner">
                <Pill size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    وصفة إلكترونية معتمدة
                  </span>
                  <span className="px-3 py-1 bg-emerald-400/30 backdrop-blur-md rounded-full text-[10px] font-black text-emerald-50 flex items-center gap-1 border border-emerald-400/20">
                    <CheckCircle size={10} />
                    نشطة
                  </span>
                </div>
                <h1 className="text-3xl font-black font-display">وصفة طبية رقم {prescription.id}</h1>
                <p className="text-emerald-100 mt-1 font-medium opacity-80 flex items-center gap-2">
                  <Calendar size={14} />
                  تاريخ الإصدار: {new Date(prescription.issuedAt).toLocaleDateString('ar-YE')}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-3xl shadow-2xl border-4 border-emerald-500/50">
              <QRCode value={`PRESCRIPTION:${prescription.id}`} size={80} />
            </div>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-10">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <User size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">المريض</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{prescription.patientName}</h3>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-500">رقم الهوية الصحية (YHID):</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">{prescription.yhid || "غير متوفر"}</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Stethoscope size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">الطبيب المعالج</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{prescription.doctorName}</h3>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-500">التخصص:</span>
                  <span className="text-sm font-black text-slate-700">طبيب عام</span>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Pill size={20} />
                </div>
                الأدوية الموصوفة
              </h3>
              
              <div className="space-y-4">
                {Array.isArray(prescription.medications) ? (
                  prescription.medications.map((med: any, idx: number) => (
                    <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900">{med.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{med.dosage} — {med.frequency}</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <p className="text-slate-700 font-medium leading-relaxed">{prescription.medications}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 space-y-3">
                <h4 className="text-sm font-black text-amber-800 flex items-center gap-2">
                  <AlertCircle size={18} />
                  تعليمات الطبيب وملاحظات
                </h4>
                <p className="text-slate-700 font-medium leading-relaxed italic">
                  "{prescription.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Status & QR */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-6">
              <h3 className="text-lg font-black">حالة الوصفة</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-sm text-slate-400 font-bold">الحالة</span>
                  <span className="text-sm font-black text-emerald-400">
                    {prescription.status === 'active' ? 'نشطة' : prescription.status === 'dispensed' ? 'تم الصرف' : 'منتهية'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-sm text-slate-400 font-bold">تاريخ الانتهاء</span>
                  <span className="text-sm font-black">{new Date(prescription.expiresAt).toLocaleDateString('ar-YE')}</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                  <Clock size={20} className="text-emerald-400" />
                  <p className="text-[10px] font-bold text-emerald-100 leading-tight">
                    هذه الوصفة صالحة للاستخدام في جميع الصيدليات المعتمدة ضمن النظام الصحي الوطني.
                  </p>
                </div>

                {prescription.status === 'active' && (
                  <button 
                    onClick={() => {
                      const success = mockDataService.dispensePrescription(prescription.id, 'PHARM-001');
                      if (success) {
                        setPrescription({ ...prescription, status: 'dispensed' });
                        alert('تم صرف الوصفة بنجاح.');
                      }
                    }}
                    className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    صرف الوصفة الآن
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm text-center space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تحقق من الوصفة</p>
              <div className="flex justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <QRCode value={`VERIFY:PRESCRIPTION:${prescription.qrHash}`} size={140} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium px-4">
                يمكن للصيدلي مسح هذا الرمز للتحقق من صحة الوصفة وصرف الأدوية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;
