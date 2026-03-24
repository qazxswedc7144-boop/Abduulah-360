import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockDataService';
import { 
  QrCode, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Pill,
  User,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PrescriptionScanner: React.FC = () => {
  const navigate = useNavigate();
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate network delay for validation
    setTimeout(() => {
      try {
        // Expected format: VERIFY:PRESCRIPTION:hash_...
        // Or just the hash if it's a direct scan
        let hash = scanInput;
        if (scanInput.startsWith('VERIFY:PRESCRIPTION:')) {
          hash = scanInput.replace('VERIFY:PRESCRIPTION:', '');
        }

        // In a real app, we'd find the ID from the hash or the QR would contain {id, hash}
        // For this mock, we'll search all prescriptions for one with this hash
        const allPrescriptions = mockDataService.getPrescriptions();
        const prescription = allPrescriptions.find(p => p.qrHash === hash);

        if (!prescription) {
          setError('لم يتم العثور على الوصفة أو الرمز غير صالح (تلاعب محتمل)');
          setLoading(false);
          return;
        }

        const validation = mockDataService.validatePrescription(prescription.id, hash);
        
        if (validation.valid) {
          setResult(validation.prescription);
        } else {
          setError(validation.reason || 'فشل التحقق من صحة الوصفة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء معالجة الرمز');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleDispense = () => {
    if (!result) return;
    
    const success = mockDataService.dispensePrescription(result.id, 'PHARM-001');
    if (success) {
      setResult({ ...result, status: 'dispensed' });
      alert('تم صرف الوصفة بنجاح وتحديث الحالة في النظام الوطني.');
    } else {
      alert('فشل صرف الوصفة. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-emerald-600 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-display">نظام صرف الوصفات الإلكترونية</h1>
          <p className="text-slate-500 font-medium">تحقق من صحة الوصفة وصرف الأدوية بأمان</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Input Section */}
        <div className="space-y-6">
          <div className="glass-card p-8 border-emerald-100 bg-emerald-50/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <QrCode size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900">مسح رمز الاستجابة السريعة</h2>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="أدخل رمز التحقق أو امسح الرمز..."
                  className="w-full pr-12 pl-4 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !scanInput}
                className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'تحقق من صحة الوصفة'}
              </button>
            </form>

            <div className="mt-8 p-6 bg-white/50 rounded-2xl border border-emerald-100/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck size={18} />
                <span className="text-sm font-black">نظام حماية ضد التزوير</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                يقوم النظام بمطابقة التوقيع الرقمي المشفر (Hash) المخزن في الرمز مع السجلات الوطنية لضمان عدم التلاعب بالوصفة أو صرفها مسبقاً.
              </p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-rose-900 font-black mb-1">فشل التحقق</h3>
                <p className="text-rose-700 text-sm font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Result Section */}
        <div className="lg:sticky lg:top-8 h-fit">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card overflow-hidden border-emerald-200"
              >
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={24} />
                    <span className="font-black">وصفة طبية صحيحة</span>
                  </div>
                  <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest">
                    {result.id}
                  </span>
                </div>

                <div className="p-8 space-y-8">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{result.patientName}</h3>
                      <p className="text-xs font-black text-emerald-600 font-mono">{result.yhid}</p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill size={14} />
                      الأدوية الموصوفة
                    </h4>
                    <div className="space-y-3">
                      {result.medications.map((med: any, i: number) => (
                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-black text-slate-900">{med.name}</p>
                            <p className="text-xs text-slate-500 font-bold">{med.dosage} — {med.frequency}</p>
                          </div>
                          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-1">الطبيب</p>
                      <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                        <Stethoscope size={14} className="text-emerald-500" />
                        {result.doctorName}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-1">تاريخ الإصدار</p>
                      <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-500" />
                        {new Date(result.issuedAt).toLocaleDateString('ar-YE')}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {result.status === 'active' ? (
                    <button 
                      onClick={handleDispense}
                      className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 group"
                    >
                      صرف الأدوية الآن
                      <ChevronRight size={20} className="group-hover:translate-x-[-4px] transition-transform" />
                    </button>
                  ) : (
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} />
                      </div>
                      <h3 className="text-emerald-900 font-black">تم صرف الوصفة</h3>
                      <p className="text-emerald-700 text-xs font-bold mt-1">
                        تم صرف هذه الوصفة بتاريخ {new Date(result.dispensedAt).toLocaleDateString('ar-YE')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <QrCode size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">في انتظار المسح...</h3>
                <p className="text-sm font-medium max-w-xs">
                  قم بإدخال رمز التحقق أو مسح الرمز المربع من تطبيق المريض لعرض تفاصيل الوصفة.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionScanner;
