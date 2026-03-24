import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Building,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  hospitalName?: string;
  phone: string;
  email?: string;
  status: 'Active' | 'Inactive';
}

const SPECIALIZATIONS = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Ophthalmology', 'Gynecology', 'Psychiatry', 'Radiology'
];

interface DoctorManagerProps {
  role: string | null;
}

export const DoctorManager: React.FC<DoctorManagerProps> = ({ role }) => {
  const isAdmin = role === 'admin';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [filterSpec, setFilterSpec] = useState<string>('All');

  // Form State
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialization: 'General Medicine',
    hospitalName: '',
    phone: '',
    email: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Doctors"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('هل أنت متأكد من حذف ملف تعريف هذا الطبيب؟')) {
      try {
        await deleteDoc(doc(db, "Doctors", id));
        setDoctors(doctors.filter(d => d.id !== id));
      } catch (err) {
        console.error("Error deleting doctor:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);
    try {
      if (editingDoctor) {
        await updateDoc(doc(db, "Doctors", editingDoctor.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "Doctors"), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setShowForm(false);
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      console.error("Error saving doctor:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                         (d.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesSpec = filterSpec === 'All' || d.specialization === filterSpec;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">إدارة الكادر الطبي</h2>
          <p className="text-slate-500 font-body">إدارة سجلات الأطباء المتخصصين في الشبكة الوطنية الصحية.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingDoctor(null);
              setFormData({
                name: '',
                specialization: 'General Medicine',
                hospitalName: '',
                phone: '',
                email: '',
                status: 'Active'
              });
              setShowForm(true);
            }}
            className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-teal-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-teal-200"
          >
            <Plus size={20} />
            إضافة طبيب جديد
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="البحث باسم الطبيب أو التخصص..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all font-body"
            />
          </div>
          <select 
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all font-body"
          >
            <option value="All">كل التخصصات</option>
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Doctors List */}
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
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Stethoscope size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا يوجد أطباء مطابقون</h3>
            <p className="text-slate-500">حاول تغيير معايير البحث أو الفلترة.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <motion.div 
              key={doctor.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-teal-200/20 transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${doctor.status === 'Active' ? 'bg-teal-500' : 'bg-slate-300'}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg font-display">{doctor.name}</h3>
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-bold">
                      {doctor.specialization}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingDoctor(doctor);
                        setFormData(doctor);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doctor.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 font-body">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Building size={16} className="text-teal-500 shrink-0" />
                  <span>{doctor.hospitalName || 'مستشفى غير محدد'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-teal-500 shrink-0" />
                  <span>{doctor.phone}</span>
                </div>
                {doctor.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-teal-500 shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}
              </div>

              <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center gap-2">
                عرض الملف المهني
                <ChevronLeft size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Doctor Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-teal-50/50">
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 font-body">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم الطبيب *</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all"
                    placeholder="د. أحمد محمد"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">التخصص *</label>
                    <select 
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all"
                    >
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم الهاتف *</label>
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all text-left"
                      dir="ltr"
                      placeholder="777 000 000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المستشفى / المركز الطبي</label>
                  <input 
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all"
                    placeholder="اسم المستشفى"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 outline-none transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب'}
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
