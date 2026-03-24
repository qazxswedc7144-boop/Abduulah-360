import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Phone, 
  MapPin, 
  ChevronRight,
  Loader2,
  ArrowLeft,
  X,
  Award,
  Building,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  location: string;
  experience: string;
  createdAt: any;
}

import { MOCK_DOCTORS } from '../mockData';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS as any);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Form state
  const initialFormState = {
    name: '',
    specialty: 'طب عام',
    clinic: '',
    phone: '',
    location: '',
    experience: '1-3 سنوات'
  };

  const [formData, setFormData] = useState(initialFormState);

  const specialties = [
    'طب عام', 'قلب وأوعية دموية', 'أطفال', 'نساء وتوليد', 
    'عظام', 'عيون', 'أنف وأذن وحنجرة', 'جراحة عامة', 
    'باطنية', 'جلدية', 'نفسية', 'أسنان'
  ];

  useEffect(() => {
    // Mocking initial load
    setLoading(false);
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingDoctor(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDoctor: Doctor = {
        id: `d${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
      setDoctors(prev => [newDoctor, ...prev]);
      resetForm();
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    
    try {
      const updatedDoctor: Doctor = {
        ...editingDoctor,
        ...formData
      };
      setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? updatedDoctor : d));
      resetForm();
    } catch (error) {
      console.error("Error updating doctor:", error);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      try {
        setDoctors(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      clinic: doctor.clinic,
      phone: doctor.phone,
      location: doctor.location,
      experience: doctor.experience
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const filteredDoctors = doctors.filter(d => 
    (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (d.specialty?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (d.clinic?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">جاري تحميل قائمة الأطباء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 to-indigo-800 text-white pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">الكوادر الطبية</h1>
              <p className="text-blue-100/80 font-medium mt-1">دليل الأطباء والاستشاريين المعتمدين</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-all active:scale-95"
          >
            <UserPlus size={20} />
            إضافة طبيب جديد
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="البحث باسم الطبيب، التخصص، أو المستشفى..."
              className="w-full pr-12 pl-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">
            <Filter size={20} />
            تصفية النتائج
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Stethoscope size={32} />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === doctor.id ? null : doctor.id)}
                        className="p-2 text-slate-300 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === doctor.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                            >
                              <button
                                onClick={() => openEditModal(doctor)}
                                className="w-full px-4 py-3 text-right text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Edit2 size={14} />
                                </div>
                                تعديل البيانات
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="w-full px-4 py-3 text-right text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                  <Trash2 size={14} />
                                </div>
                                حذف الطبيب
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2">{doctor.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {doctor.specialty}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                      خبرة: {doctor.experience}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Building size={16} />
                      </div>
                      <span className="text-sm font-medium">{doctor.clinic}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Phone size={16} />
                      </div>
                      <span className="text-sm font-medium">{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <span className="text-sm font-medium">{doctor.location}</span>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-slate-50 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    عرض الجدول الزمني
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">لا توجد نتائج</h3>
            <p className="text-slate-500 mt-2">جرب البحث بكلمات أخرى أو أضف طبيباً جديداً</p>
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {isEditModalOpen ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {isEditModalOpen ? 'تحديث معلومات الكادر الطبي' : 'تسجيل كادر طبي جديد في النظام'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditDoctor : handleAddDoctor} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">اسم الطبيب</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="د. الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">التخصص</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    >
                      {specialties.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">المستشفى / العيادة</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="اسم المنشأة الطبية"
                      value={formData.clinic}
                      onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="77xxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">الموقع</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="المحافظة - المدينة"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">سنوات الخبرة</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    >
                      {['1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'].map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    حفظ البيانات
                  </button>
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
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

export default Doctors;
