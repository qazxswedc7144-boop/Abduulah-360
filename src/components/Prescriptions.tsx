import React, { useState, useEffect } from 'react';
import { mockDataService } from '../services/mockDataService';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Calendar, 
  ChevronRight,
  Loader2,
  ArrowLeft,
  X,
  Pill,
  User,
  Stethoscope,
  Edit2,
  Trash2,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface Prescription {
  id: string;
  yhid: string;
  doctorId: string;
  doctorName?: string;
  patientName?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  notes: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'dispensed' | 'expired';
  qrHash: string;
}

const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = () => {
      setLoading(true);
      const data = mockDataService.getPrescriptions();
      setPrescriptions(data as any);
      setLoading(false);
    };
    fetchPrescriptions();
  }, []);
  
  // Form state
  const initialFormState = {
    patientName: '',
    yhid: '',
    doctorName: '',
    doctorId: 'd1',
    notes: '',
    medications: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingPrescription(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPrescription = mockDataService.addPrescription({
        patientName: formData.patientName,
        yhid: formData.yhid,
        doctorName: formData.doctorName,
        doctorId: formData.doctorId,
        notes: formData.notes,
        medications: [{ name: formData.medications, dosage: '', frequency: '' }],
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        qrHash: `hash_${Date.now()}`
      });

      setPrescriptions(prev => [newPrescription as any, ...prev]);
      resetForm();
    } catch (error) {
      console.error("Error adding prescription:", error);
    }
  };

  const handleEditPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescription) return;
    
    try {
      const updates = {
        patientName: formData.patientName,
        yhid: formData.yhid,
        doctorName: formData.doctorName,
        notes: formData.notes,
        medications: [{ name: formData.medications, dosage: '', frequency: '' }]
      };

      mockDataService.updatePrescription(editingPrescription.id, updates);
      setPrescriptions(prev => prev.map(p => p.id === editingPrescription.id ? { ...p, ...updates } : p));
      resetForm();
    } catch (error) {
      console.error("Error updating prescription:", error);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوصفة؟')) {
      try {
        mockDataService.deletePrescription(id);
        setPrescriptions(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting prescription:", error);
      }
    }
  };

  const openEditModal = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patientName: prescription.patientName || '',
      yhid: prescription.yhid,
      doctorName: prescription.doctorName || '',
      doctorId: prescription.doctorId,
      notes: prescription.notes,
      medications: prescription.medications[0]?.name || ''
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    (p.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.yhid?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gov-blue animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">جاري تحميل السجلات الدوائية...</p>
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
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Pill size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">الوصفات الطبية</h2>
              <p className="text-xs text-slate-500 font-bold">إدارة وتتبع الوصفات الدوائية للمرضى</p>
            </div>
          </div>
        <div className="flex gap-4">
          <Link 
            to="/pharmacy/scan"
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
          >
            <QrCode size={20} />
            صرف وصفة (QR)
          </Link>
          <Link 
            to="/prescription/new"
            className="flex items-center justify-center gap-2 bg-gov-blue text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            إصدار وصفة جديدة
          </Link>
        </div>
        </div>
        {/* Search & Filter Bar */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="البحث باسم المريض، الطبيب، أو التشخيص..."
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

        {/* Prescriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPrescriptions.map((prescription, index) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card glass-card-hover group overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 backdrop-blur-md border border-white/20">
                      <FileText size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs font-bold text-slate-500 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        {new Date(prescription.issuedAt).toLocaleDateString('ar-YE')}
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === prescription.id ? null : prescription.id)}
                          className="p-2 text-slate-400 rounded-xl hover:bg-white/20 transition-all border border-transparent hover:border-white/20"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === prescription.id && (
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
                                  onClick={() => openEditModal(prescription)}
                                  className="w-full px-4 py-3 text-right text-sm font-bold text-slate-700 hover:bg-white/20 flex items-center gap-3 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                    <Edit2 size={14} />
                                  </div>
                                  تعديل الوصفة
                                </button>
                                <button
                                  onClick={() => handleDeletePrescription(prescription.id)}
                                  className="w-full px-4 py-3 text-right text-sm font-bold text-rose-600 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <Trash2 size={14} />
                                  </div>
                                  حذف الوصفة
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1 font-display">{prescription.patientName}</h3>
                  <p className="text-xs font-black text-emerald-600 mb-2 font-mono">{prescription.yhid || "YHID-2026-XXXXXX"}</p>
                  <p className="text-indigo-600 text-sm font-bold mb-6">ملاحظات: {prescription.notes}</p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Stethoscope size={16} />
                      </div>
                      <span className="text-sm font-medium">د. {prescription.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Pill size={16} />
                      </div>
                      <span className="text-sm font-medium truncate">
                        {prescription.medications.map(m => m.name).join(', ')}
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={`/prescription/${prescription.id}`}
                    className="w-full py-4 bg-white/10 backdrop-blur-md text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/10"
                  >
                    عرض الوصفة كاملة
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">لا توجد نتائج</h3>
            <p className="text-slate-500 mt-2">جرب البحث بكلمات أخرى أو أصدر وصفة جديدة</p>
          </div>
        )}
      </div>

      {/* Add/Edit Prescription Modal */}
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
                    {isEditModalOpen ? 'تعديل الوصفة الطبية' : 'إصدار وصفة طبية'}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {isEditModalOpen ? 'تحديث بيانات الوصفة الإلكترونية' : 'نظام الوصفات الإلكترونية المعتمد'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditPrescription : handleAddPrescription} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">اسم المريض</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="أدخل اسم المريض"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">YHID</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="YHID-2026-XXXXXX"
                      value={formData.yhid}
                      onChange={(e) => setFormData({...formData, yhid: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">اسم الطبيب</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="د. الاسم الكامل"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-2">معرف الطبيب</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="d1"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">ملاحظات</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="وصف الحالة الطبية أو ملاحظات"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2">الأدوية</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                    placeholder="اسم الدواء - الجرعة - التكرار"
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    اعتماد الوصفة
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

export default Prescriptions;
