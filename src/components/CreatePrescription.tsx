import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../services/mockDataService";
import { motion } from "motion/react";
import { 
  Pill, 
  User, 
  Stethoscope, 
  Plus, 
  ChevronLeft, 
  Send,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const CreatePrescription: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPatients, setFetchingPatients] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await mockDataService.getPatients();
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setFetchingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    (newMeds[index] as any)[field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError("يرجى اختيار مريض");
      return;
    }
    if (medications.some(m => !m.name)) {
      setError("يرجى إدخال اسم الدواء على الأقل");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      const doctors = await mockDataService.getDoctors();
      const doctor = doctors[0] || { id: "d1", name: "د. خالد العبسي" };

      const prescriptionData = {
        yhid: selectedPatient?.yhid,
        patientName: selectedPatient?.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        medications: medications,
        notes: notes || "تم إصدار الوصفة عبر النظام الإلكتروني",
      };

      const newPrescription = await mockDataService.addPrescription(prescriptionData);
      
      setSuccess(true);
      setTimeout(() => navigate(`/prescription/${newPrescription.id}`), 2000);
    } catch (err: any) {
      setError(err.message || "فشل في إنشاء الوصفة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all">
        <ChevronLeft size={20} />
        العودة
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Plus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إنشاء وصفة طبية جديدة</h1>
              <p className="text-emerald-100 mt-1">أدخل تفاصيل الأدوية للمريض</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2 text-sm">
              <CheckCircle size={18} />
              تم إنشاء الوصفة بنجاح! جاري التحويل...
            </div>
          )}

          {/* Patient Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-emerald-500" />
              اختر المريض
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={fetchingPatients}
              className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm"
              required
            >
              <option value="">-- اختر مريضاً --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.yhid || p.nationalId})</option>
              ))}
            </select>
          </div>

          {/* Medications List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill size={18} className="text-emerald-500" />
                الأدوية
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} />
                إضافة دواء
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative"
                >
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="absolute top-4 left-4 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      حذف
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">اسم الدواء</p>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedChange(index, "name", e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="مثال: بنادول"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">الجرعة</p>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(index, "dosage", e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="مثال: 500 ملغ"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">التكرار</p>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="مثال: 3 مرات يومياً"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              ملاحظات إضافية
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm min-h-[100px] resize-none"
              placeholder="أي تعليمات إضافية للمريض أو الصيدلي..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Send size={20} />
                إرسال الوصفة الطبية
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePrescription;
