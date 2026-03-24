import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  ShieldCheck,
  Filter,
  ChevronRight,
  ChevronLeft,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FHIRPatient } from '../types/fhir';
import { PatientProfileForm } from './PatientProfileForm';
import { mockDataService } from '../services/mockDataService';

export const PatientManager: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<FHIRPatient | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  const fetchPatients = async (isNext = false) => {
    setLoading(true);
    try {
      let data;
      if (searchTerm) {
        data = mockDataService.searchPatients(searchTerm);
      } else {
        data = mockDataService.getPatients();
      }
      
      setPatients(data);
      setHasMore(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف ملف تعريف هذا المريض؟')) {
      try {
        await mockDataService.deletePatient(id);
        setPatients(patients.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting patient:", err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">إدارة ملفات تعريف المرضى</h2>
          <p className="text-slate-500">قم بإنشاء وتعديل وإدارة السجلات الطبية الوطنية للمواطنين.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPatient(undefined);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          إضافة مريض جديد
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="البحث بالاسم، YHID، الرقم الوطني، أو الهاتف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => alert('جاري تشغيل الكاميرا لمسح YHID...')}
          className="px-6 py-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors font-bold"
        >
          <Activity size={20} />
          مسح YHID
        </button>
        <button className="px-6 py-3 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={20} />
          تصفية متقدمة
        </button>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && patients.length === 0 ? (
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
        ) : (
          patients.map((patient) => (
            <motion.div 
              key={patient.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{patient.name[0].text}</h3>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] text-blue-600 font-black flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                        <ShieldCheck size={10} />
                        {patient.yhid || 'بدون YHID'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 px-2">
                        ID: {patient.id}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingPatient(patient);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(patient.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Calendar size={16} className="text-slate-400" />
                  <span>تاريخ الميلاد: {patient.birthDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Phone size={16} className="text-slate-400" />
                  <span>{patient.telecom.find(t => t.system === 'phone')?.value || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{patient.telecom.find(t => t.system === 'email')?.value || 'غير متوفر'}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/patient/${patient.id}`)}
                className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                عرض الملف الكامل
                <ChevronLeft size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-12 text-center">
          <button 
            onClick={() => fetchPatients(true)}
            className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            تحميل المزيد
          </button>
        </div>
      )}

      {/* Patient Profile Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <PatientProfileForm 
              initialData={editingPatient}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchPatients();
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
