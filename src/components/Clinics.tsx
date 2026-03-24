import React, { useState, useEffect } from 'react';
import { mockDataService } from '../services/mockDataService';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Phone, 
  MapPin, 
  ChevronRight,
  Loader2,
  ArrowLeft,
  X,
  Hospital,
  Activity,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
  type: string;
  location: string;
  phone: string;
  status: string;
  createdAt: any;
}

const Clinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Form state
  const initialFormState = {
    name: '',
    type: 'عيادة تخصصية',
    location: '',
    phone: '',
    status: 'نشط'
  };

  const [formData, setFormData] = useState(initialFormState);

  const clinicTypes = [
    'عيادة تخصصية', 'مركز صحي', 'مستشفى حكومي', 'مستشفى خاص', 
    'مختبر طبي', 'مركز أشعة', 'صيدلية مركزية'
  ];

  useEffect(() => {
    const fetchClinics = () => {
      setLoading(true);
      const data = mockDataService.getClinics();
      setClinics(data as any);
      setLoading(false);
    };
    fetchClinics();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingClinic(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newClinic = mockDataService.addClinic({
        ...formData
      });

      setClinics(prev => [newClinic as any, ...prev]);
      resetForm();
    } catch (error) {
      console.error("Error adding clinic:", error);
    }
  };

  const handleEditClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic) return;
    
    try {
      mockDataService.updateClinic(editingClinic.id, formData);
      setClinics(prev => prev.map(c => c.id === editingClinic.id ? { ...c, ...formData } : c));
      resetForm();
    } catch (error) {
      console.error("Error updating clinic:", error);
    }
  };

  const handleDeleteClinic = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المنشأة؟')) {
      try {
        mockDataService.deleteClinic(id);
        setClinics(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting clinic:", error);
      }
    }
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      type: clinic.type,
      location: clinic.location,
      phone: clinic.phone,
      status: clinic.status
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const filteredClinics = clinics.filter(c => 
    (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">جاري تحميل بيانات المنشآت الطبية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-700 to-blue-800 text-white pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">المنشآت الطبية</h1>
              <p className="text-indigo-100/80 font-medium mt-1">إدارة العيادات والمراكز الصحية الوطنية</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 transition-all active:scale-95"
          >
            <Building2 size={20} />
            إضافة منشأة جديدة
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {/* Search & Filter Bar */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="البحث باسم المنشأة، النوع، أو الموقع..."
              className="w-full pr-12 pl-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-white/10 backdrop-blur-md text-slate-600 hover:bg-white/20'}`}
            >
              <Building2 size={20} />
              قائمة
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-white/10 backdrop-blur-md text-slate-600 hover:bg-white/20'}`}
            >
              <MapPin size={20} />
              خريطة
            </button>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-md text-slate-600 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20">
            <Filter size={20} />
            تصفية
          </button>
        </div>

        {viewMode === 'grid' ? (
          /* Clinics Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredClinics.map((clinic, index) => (
                <motion.div
                  key={clinic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card glass-card-hover group overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 backdrop-blur-md border border-white/20">
                        <Hospital size={32} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 ${
                          clinic.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {clinic.status}
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === clinic.id ? null : clinic.id)}
                            className="p-2 text-slate-400 rounded-xl hover:bg-white/20 transition-all border border-transparent hover:border-white/20"
                          >
                            <MoreVertical size={20} />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenu === clinic.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveMenu(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute left-0 mt-2 w-48 glass-card p-0 z-20 overflow-hidden"
                                >
                                  <button
                                    onClick={() => openEditModal(clinic)}
                                    className="w-full px-4 py-3 text-right text-sm font-bold text-slate-700 hover:bg-white/20 flex items-center gap-3 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                      <Edit2 size={14} />
                                    </div>
                                    تعديل البيانات
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClinic(clinic.id)}
                                    className="w-full px-4 py-3 text-right text-sm font-bold text-rose-600 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                      <Trash2 size={14} />
                                    </div>
                                    حذف المنشأة
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2 font-display">{clinic.name}</h3>
                    <p className="text-indigo-600 text-sm font-bold mb-6">{clinic.type}</p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <MapPin size={16} />
                        </div>
                        <span className="text-sm font-medium">{clinic.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Phone size={16} />
                        </div>
                        <span className="text-sm font-medium">{clinic.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Activity size={16} />
                        </div>
                        <span className="text-sm font-medium">نظام الربط الإلكتروني: مفعل</span>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-white/10 backdrop-blur-md text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/10">
                      إدارة المنشأة
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Map View Placeholder */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden h-[600px] relative"
          >
            <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md px-6">
                <div className="w-24 h-24 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce backdrop-blur-md border border-white/20">
                  <MapPin size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-display">خريطة المنشآت الصحية</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  يتم حالياً دمج خرائط جوجل لتوفير تجربة تفاعلية تتيح لك العثور على أقرب منشأة طبية وحجز المواعيد مباشرة.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-right">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">أقرب منشأة</p>
                    <p className="text-sm font-black text-slate-900">مستشفى الثورة العام</p>
                  </div>
                  <div className="glass-card p-4 text-right">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">المسافة</p>
                    <p className="text-sm font-black text-slate-900">2.4 كم</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">
                  تفعيل الموقع الجغرافي
                </button>
              </div>
            </div>
            
            {/* Map UI Overlay */}
            <div className="absolute top-6 right-6 space-y-4">
              {filteredClinics.slice(0, 3).map(c => (
                <div key={c.id} className="glass-card p-4 w-64 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Hospital size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 truncate font-display">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{c.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {filteredClinics.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">لا توجد نتائج</h3>
            <p className="text-slate-500 mt-2">جرب البحث بكلمات أخرى أو أضف منشأة جديدة</p>
          </div>
        )}
      </div>

      {/* Add/Edit Clinic Modal */}
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
                    {isEditModalOpen ? 'تعديل بيانات المنشأة' : 'إضافة منشأة طبية'}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {isEditModalOpen ? 'تحديث معلومات المنشأة الطبية' : 'تسجيل مستشفى أو عيادة جديدة في الشبكة'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditClinic : handleAddClinic} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">اسم المنشأة</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="أدخل اسم المستشفى أو العيادة"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">نوع المنشأة</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      {clinicTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">الموقع / العنوان</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="المحافظة - المديرية"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="01xxxxxx / 77xxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">حالة المنشأة</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="نشط">نشط</option>
                      <option value="غير نشط">غير نشط</option>
                      <option value="تحت الصيانة">تحت الصيانة</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    تسجيل المنشأة
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

export default Clinics;
