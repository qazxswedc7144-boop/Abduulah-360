import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  FileText, 
  User, 
  Stethoscope, 
  Calendar, 
  Clock,
  Filter,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { mockDataService } from '../services/mockDataService';
import { MOCK_PRESCRIPTIONS } from '../mockData';

export interface Prescription {
  id: string;
  yhid: string;
  doctorId: string;
  doctorName?: string;
  patientName?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'dispensed' | 'expired';
  qrHash: string;
  notes: string;
}

interface PrescriptionManagerProps {
  role: string | null;
}

export const PrescriptionManager: React.FC<PrescriptionManagerProps> = ({ role }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS as any);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await mockDataService.getPrescriptions();
      setPrescriptions(data as any);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      (p.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.yhid?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">إدارة الوصفات الطبية</h2>
          <p className="text-slate-500 font-body">تتبع وصرف الوصفات الطبية الإلكترونية الموحدة.</p>
        </div>
        {role === 'doctor' && (
          <Link 
            to="/create-prescription"
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            إنشاء وصفة جديدة
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="البحث برقم الوصفة، اسم المريض، أو YHID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-body"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-body"
          >
            <option value="All">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="dispensed">تم الصرف</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filteredPrescriptions.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Pill size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد وصفات طبية</h3>
            <p className="text-slate-500">لم يتم العثور على أي وصفات مطابقة لمعايير البحث.</p>
          </div>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <motion.div 
              key={prescription.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${prescription.status === 'dispensed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">وصفة #{prescription.id.slice(-6).toUpperCase()}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${prescription.status === 'dispensed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {prescription.status === 'dispensed' ? 'تم الصرف' : 'قيد الانتظار'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-body">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="font-bold">{prescription.patientName || 'غير محدد'}</span>
                          <span className="text-[10px] text-blue-600 font-bold">{prescription.yhid || 'بدون YHID'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Stethoscope size={14} className="text-slate-400" />
                        <span>الطبيب: {prescription.doctorName || 'د. أحمد محمد'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>التاريخ: {new Date(prescription.issuedAt).toLocaleDateString('ar-YE')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 md:flex-none">
                    <p className="text-xs text-slate-400 mb-1">الأدوية ({prescription.medications.length})</p>
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {prescription.medications.slice(0, 3).map((med, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {med.name[0]}
                        </div>
                      ))}
                      {prescription.medications.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          +{prescription.medications.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link 
                    to={`/prescription/${prescription.id}`}
                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
