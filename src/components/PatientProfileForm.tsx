import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Activity, 
  Stethoscope, 
  Pill, 
  AlertCircle,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { FHIRPatient, FHIRCondition, FHIRAllergyIntolerance, FHIRMedicationStatement, FHIRProcedure } from '../types/fhir';
import { mockDataService } from '../services/mockDataService';

interface PatientProfileFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: FHIRPatient;
}

export const PatientProfileForm: React.FC<PatientProfileFormProps> = ({ onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demographics
  const [nationalId, setNationalId] = useState(initialData?.id || '');
  const [nameAr, setNameAr] = useState(initialData?.name[0]?.text || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [gender, setGender] = useState<FHIRPatient['gender']>(initialData?.gender || 'unknown');
  const [phone, setPhone] = useState(initialData?.telecom.find(t => t.system === 'phone')?.value || '');
  const [email, setEmail] = useState(initialData?.telecom.find(t => t.system === 'email')?.value || '');
  const [city, setCity] = useState(initialData?.address[0]?.city || '');
  const [state, setState] = useState(initialData?.address[0]?.state || '');
  const [bloodType, setBloodType] = useState(initialData?.bloodType || 'O+');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Medical History (Conditions)
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  // Surgeries (Procedures)
  const [surgeries, setSurgeries] = useState<string[]>([]);
  const [newSurgery, setNewSurgery] = useState('');

  // Medications
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');

  // Allergies
  const [allergies, setAllergies] = useState<{ text: string, category: FHIRAllergyIntolerance['category'][0] }[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newAllergyCategory, setNewAllergyCategory] = useState<FHIRAllergyIntolerance['category'][0]>('medication');

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleAddSurgery = () => {
    if (newSurgery.trim()) {
      setSurgeries([...surgeries, newSurgery.trim()]);
      setNewSurgery('');
    }
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, { text: newAllergy.trim(), category: newAllergyCategory }]);
      setNewAllergy('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId || !nameAr || !birthDate) {
      setError('يرجى ملء جميع الحقول الأساسية (الرقم الوطني، الاسم، تاريخ الميلاد)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const patientData: FHIRPatient = {
        resourceType: "Patient",
        id: nationalId,
        yhid: initialData?.yhid || "", // Will be generated if empty
        nationalId: nationalId,
        active: true,
        bloodType,
        emergencyContact,
        name: [{
          use: "official",
          text: nameAr,
          family: nameAr.split(' ').pop() || '',
          given: nameAr.split(' ').slice(0, -1)
        }],
        telecom: [
          { system: "phone", value: phone, use: "mobile" },
          { system: "email", value: email, use: "home" }
        ],
        gender,
        birthDate,
        address: [{
          use: "home",
          type: "both",
          text: `${state}, ${city}`,
          city,
          district: "",
          state
        }]
      };

      if (initialData) {
        await mockDataService.updatePatient(nationalId, patientData);
      } else {
        await mockDataService.addPatient(patientData);
      }

      // In a real app, we'd save conditions, surgeries, etc. to subcollections
      // For mock, we'll just simulate success
      onSuccess();
    } catch (err: any) {
      console.error("Error saving patient profile:", err);
      setError('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      dir="rtl"
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="text-blue-600" />
          {initialData ? 'تعديل ملف تعريف المريض' : 'إنشاء ملف تعريف مريض جديد'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={24} className="text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Demographics Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-blue-100 pb-2">
            <User size={20} />
            <h3>المعلومات الديموغرافية</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الرقم الوطني</label>
              <div className="relative">
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="10XXXXXXXX"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={!!initialData}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الاسم الكامل (بالعربية)</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="الاسم الرباعي"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">تاريخ الميلاد</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الجنس</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
                <option value="other">آخر</option>
                <option value="unknown">غير معروف</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7XXXXXXXX"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">المحافظة</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="مثال: عدن، صنعاء"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">المدينة</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="اسم المدينة"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">فصيلة الدم</label>
              <select 
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">جهة الاتصال في حالات الطوارئ</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel" 
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="رقم قريب أو صديق"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Medical History Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-rose-600 font-bold border-b border-rose-100 pb-2">
            <Activity size={20} />
            <h3>التاريخ الطبي</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Past Illnesses */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الأمراض السابقة</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="أضف مرضاً..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  type="button"
                  onClick={handleAddCondition}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {conditions.map((c, i) => (
                  <span key={i} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-rose-100">
                    {c}
                    <button type="button" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Surgeries */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الجراحات السابقة</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSurgery}
                  onChange={(e) => setNewSurgery(e.target.value)}
                  placeholder="أضف جراحة..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  type="button"
                  onClick={handleAddSurgery}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {surgeries.map((s, i) => (
                  <span key={i} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-rose-100">
                    {s}
                    <button type="button" onClick={() => setSurgeries(surgeries.filter((_, idx) => idx !== i))}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الأدوية الحالية</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="أضف دواءً..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  type="button"
                  onClick={handleAddMedication}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {medications.map((m, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-emerald-100">
                    <Pill size={14} />
                    {m}
                    <button type="button" onClick={() => setMedications(medications.filter((_, idx) => idx !== i))}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Allergies Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-amber-600 font-bold border-b border-amber-100 pb-2">
            <AlertCircle size={20} />
            <h3>الحساسية</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={newAllergyCategory}
                onChange={(e) => setNewAllergyCategory(e.target.value as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="medication">حساسية أدوية</option>
                <option value="food">حساسية طعام</option>
                <option value="environment">حساسية بيئية</option>
                <option value="biologic">حساسية بيولوجية</option>
              </select>
              <input 
                type="text" 
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="نوع الحساسية (مثال: بنسلين، مكسرات)..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button 
                type="button"
                onClick={handleAddAllergy}
                className="p-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-amber-100">
                  <span className="text-[10px] font-bold uppercase opacity-60">
                    {a.category === 'medication' ? 'دواء' : a.category === 'food' ? 'طعام' : 'بيئة'}
                  </span>
                  {a.text}
                  <button type="button" onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>
      </form>

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
        <button 
          onClick={onClose}
          className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          إلغاء
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          حفظ الملف الشخصي
        </button>
      </div>
    </motion.div>
  );
};
