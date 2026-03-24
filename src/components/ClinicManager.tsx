import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Clinic {
  id: string;
  name: string;
  type: 'General' | 'Specialized' | 'Laboratory' | 'Pharmacy' | 'Emergency Center';
  governorate: string;
  address: string;
  phone: string;
  email?: string;
  workingHours?: string;
  status: 'Active' | 'Inactive';
}

const GOVERNORATES = [
  'صنعاء', 'عدن', 'تعز', 'الحديدة', 'حضرموت', 'إب', 'ذمار', 'حجة', 'صعدة', 'عمران', 'مأرب', 'الجوف', 'البيضاء', 'شبوة', 'المهرة', 'أبين', 'لحج', 'الضالع', 'ريمة', 'سقطرى'
];

const CLINIC_TYPES = ['General', 'Specialized', 'Laboratory', 'Pharmacy', 'Emergency Center'];

interface ClinicManagerProps {
  role: string | null;
}

export const ClinicManager: React.FC<ClinicManagerProps> = ({ role }) => {
  const isAdmin = role === 'admin';

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterGov, setFilterGov] = useState<string>('All');

  // Form State
  const [formData, setFormData] = useState<Partial<Clinic>>({
    name: '',
    type: 'General',
    governorate: 'صنعاء',
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Clinics"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clinic));
      setClinics(data);
    } catch (err) {
      console.error("Error fetching clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('هل أنت متأكد من حذف هذه المنشأة؟')) {
      try {
        await deleteDoc(doc(db, "Clinics", id));
        setClinics(clinics.filter(c => c.id !== id));
      } catch (err) {
        console.error("Error deleting clinic:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);
    try {
      if (editingClinic) {
        await updateDoc(doc(db, "Clinics", editingClinic.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "Clinics"), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setShowForm(false);
      setEditingClinic(null);
      fetchClinics();
    } catch (err) {
      console.error("Error saving clinic:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClinics = clinics.filter(c => {
    const matchesSearch = (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                         (c.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    const matchesGov = filterGov === 'All' || c.governorate === filterGov;
    return matchesSearch && matchesType && matchesGov;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">إدارة المنشآت الطبية</h2>
          <p className="text-slate-500 font-body">إدارة وتحديث بيانات المستشفيات والمراكز الصحية والعيادات في اليمن.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingClinic(null);
              setFormData({
                name: '',
                type: 'General',
                governorate: 'صنعاء',
                address: '',
                phone: '',
                email: '',
                workingHours: '',
                status: 'Active'
              });
              setShowForm(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            إضافة منشأة جديدة
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="البحث باسم المنشأة أو العنوان..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-body"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-body"
          >
            <option value="All">كل الأنواع</option>
            {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={filterGov}
            onChange={(e) => setFilterGov(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-body"
          >
            <option value="All">كل المحافظات</option>
            {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Clinics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-50 rounded w-full" />
                <div className="h-3 bg-slate-50 rounded w-5/6" />
              </div>
            </div>
          ))
        ) : filteredClinics.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Building2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منشآت مطابقة</h3>
            <p className="text-slate-500">حاول تغيير معايير البحث أو الفلترة.</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <motion.div 
              key={clinic.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-200/20 transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${clinic.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg font-display">{clinic.name}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 font-bold">
                      {clinic.type}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingClinic(clinic);
                        setFormData(clinic);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(clinic.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 font-body">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-emerald-500 mt-1 shrink-0" />
                  <span>{clinic.governorate} - {clinic.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-emerald-500 shrink-0" />
                  <span>{clinic.phone}</span>
                </div>
                {clinic.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{clinic.email}</span>
                  </div>
                )}
                {clinic.workingHours && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock size={16} className="text-emerald-500 shrink-0" />
                    <span>{clinic.workingHours}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {clinic.status === 'Active' ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-400" />
                  )}
                  <span className={`text-xs font-bold ${clinic.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {clinic.status === 'Active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <button className="text-xs font-bold text-emerald-600 hover:underline">
                  عرض التفاصيل
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Clinic Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {editingClinic ? 'تعديل بيانات المنشأة' : 'إضافة منشأة طبية جديدة'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto font-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">اسم المنشأة *</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      placeholder="مثال: مستشفى الثورة العام"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">نوع المنشأة *</label>
                    <select 
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    >
                      {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">المحافظة *</label>
                    <select 
                      required
                      value={formData.governorate}
                      onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    >
                      {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم الهاتف *</label>
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all text-left"
                      dir="ltr"
                      placeholder="777 000 000"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">العنوان بالتفصيل *</label>
                    <input 
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      placeholder="الشارع، الحي، المعالم القريبة"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ساعات العمل</label>
                    <input 
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      placeholder="مثال: 24 ساعة / 8 صباحاً - 8 مساءً"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الحالة</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="Active">نشط</option>
                      <option value="Inactive">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    {editingClinic ? 'حفظ التعديلات' : 'إضافة المنشأة'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
