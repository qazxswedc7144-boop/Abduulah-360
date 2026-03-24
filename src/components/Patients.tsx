import React, { useState, useEffect } from 'react';
import { mockDataService } from '../services/mockDataService';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Phone, 
  Calendar, 
  ChevronRight,
  Loader2,
  ArrowLeft,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  nationalId: string;
  phone: string;
  address: string;
  bloodType: string;
  createdAt: any;
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [role] = useState<string | null>('admin');

  useEffect(() => {
    const fetchPatients = () => {
      setLoading(true);
      const data = mockDataService.getPatients();
      setPatients(data as any);
      setLoading(false);
    };
    fetchPatients();
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'ذكر',
    nationalId: '',
    phone: '',
    address: '',
    bloodType: 'A+'
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPatient = mockDataService.addPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        nationalId: formData.nationalId,
        phone: formData.phone,
        address: formData.address,
        bloodType: formData.bloodType
      });

      setPatients(prev => [newPatient as any, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    try {
      const updates = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        nationalId: formData.nationalId,
        phone: formData.phone,
        address: formData.address,
        bloodType: formData.bloodType
      };

      mockDataService.updatePatient(editingPatient.id, updates);
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...updates } : p));
      setIsEditModalOpen(false);
      setEditingPatient(null);
      resetForm();
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      mockDataService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      setActiveMenu(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      nationalId: patient.nationalId,
      phone: patient.phone,
      address: patient.address,
      bloodType: patient.bloodType
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'ذكر',
      nationalId: '',
      phone: '',
      address: '',
      bloodType: 'A+'
    });
  };

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.nationalId || "").includes(searchTerm) ||
    (p.phone || "").includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gov-blue animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">جاري تحميل سجلات المرضى...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gov-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">سجل المرضى</h2>
              <p className="text-xs text-slate-500 font-bold">إدارة وتتبع بيانات المواطنين الصحية</p>
            </div>
          </div>
          {(role === 'doctor' || role === 'admin') && (
            <button 
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-gov-blue text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <UserPlus size={20} />
              إضافة مريض جديد
            </button>
          )}
        </div>
        {/* Search & Filter Bar */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="البحث بالاسم، الرقم الوطني، أو رقم الهاتف..."
              className="w-full pr-12 pl-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-md text-slate-600 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20">
            <Filter size={20} />
            تصفية النتائج
          </button>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card glass-card-hover group overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 backdrop-blur-md border border-white/20">
                      <Users size={32} />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/20 transition-all border border-transparent hover:border-white/20"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === patient.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute left-0 mt-2 w-48 glass-card p-0 z-20 overflow-hidden"
                            >
                              <button 
                                onClick={() => openEditModal(patient)}
                                className="w-full px-4 py-3 text-right text-sm font-bold text-slate-600 hover:bg-white/20 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                  <Edit2 size={16} />
                                </div>
                                تعديل البيانات
                              </button>
                              <button 
                                onClick={() => handleDeletePatient(patient.id)}
                                className="w-full px-4 py-3 text-right text-sm font-bold text-rose-600 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                  <Trash2 size={16} />
                                </div>
                                حذف السجل
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2 font-display">{patient.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-slate-600 text-xs font-bold rounded-full border border-white/20">
                      {patient.gender}
                    </span>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 text-xs font-bold rounded-full border border-indigo-500/10">
                      فصيلة: {patient.bloodType}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Calendar size={16} />
                      </div>
                      <span className="text-sm font-medium">{patient.age} سنة</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Phone size={16} />
                      </div>
                      <span className="text-sm font-medium">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Search size={16} />
                      </div>
                      <span className="text-sm font-medium">الرقم الوطني: {patient.nationalId}</span>
                    </div>
                  </div>

                  <Link 
                    to={`/patient/${patient.id}`}
                    className="w-full py-4 bg-white/10 backdrop-blur-md text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/10"
                  >
                    الملف الطبي الكامل
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">لا توجد نتائج</h3>
            <p className="text-slate-500 mt-2">جرب البحث بكلمات أخرى أو أضف مريضاً جديداً</p>
          </div>
        )}
      </div>

      {/* Add/Edit Patient Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingPatient(null);
              }}
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
                    {isEditModalOpen ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
                  </h2>
                  <p className="text-slate-500 font-medium">يرجى إدخال البيانات بدقة</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingPatient(null);
                  }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditPatient : handleAddPatient} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">الاسم الكامل</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="أدخل اسم المريض"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">الرقم الوطني</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="11 رقم"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">العمر</label>
                    <input 
                      required
                      type="number"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="سنة"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="77xxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">الجنس</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">فصيلة الدم</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">العنوان</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="المحافظة - المديرية - الشارع"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    {isEditModalOpen ? 'تحديث البيانات' : 'حفظ البيانات'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setEditingPatient(null);
                    }}
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

export default Patients;
