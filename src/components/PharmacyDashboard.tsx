import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Pill, 
  Search, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  QrCode,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { mockDataService } from "../services/mockDataService";

const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "dispensed">("pending");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const presData = await mockDataService.getPrescriptions();
      const patients = await mockDataService.getPatients();
      
      const enrichedData = presData.map((pres: any) => {
        const patient = patients.find(p => p.id === pres.patientId);
        return {
          ...pres,
          patientName: patient ? patient.name : "مريض غير معروف",
          patientNationalId: patient ? patient.nationalId : ""
        };
      });
      
      setPrescriptions(enrichedData);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (id: string) => {
    try {
      await mockDataService.updatePrescription(id, { status: "dispensed" });
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: "dispensed" } : p));
    } catch (error) {
      console.error("Error dispensing prescription:", error);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patientName.includes(searchTerm) || 
      p.patientNationalId.includes(searchTerm) ||
      p.id.includes(searchTerm);
    
    const matchesFilter = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">لوحة تحكم الصيدلية</h1>
          <p className="text-slate-500 mt-1">إدارة وصرف الوصفات الطبية الإلكترونية</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="بحث برقم الوصفة أو المريض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilterStatus("dispensed")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'dispensed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              تم الصرف
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              الكل
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">وصفات قيد الانتظار</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {prescriptions.filter(p => p.status === 'pending').length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">تم صرفها اليوم</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {prescriptions.filter(p => p.status === 'dispensed').length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <QrCode size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">إجمالي الوصفات</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{prescriptions.length}</h3>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="text-emerald-600" size={24} />
            قائمة الوصفات الطبية
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-slate-500">جاري تحميل الوصفات...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <p className="text-slate-500">لا توجد وصفات طبية مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="px-6 py-4 font-bold">رقم الوصفة</th>
                  <th className="px-6 py-4 font-bold">المريض</th>
                  <th className="px-6 py-4 font-bold">التاريخ</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredPrescriptions.map((pres) => (
                    <motion.tr
                      key={pres.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-400">#{pres.id.slice(-8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{pres.patientName}</p>
                          <p className="text-xs text-slate-500">{pres.patientNationalId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar size={14} />
                          {pres.date instanceof Date ? pres.date.toLocaleDateString('ar-YE') : 'اليوم'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pres.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {pres.status === 'pending' ? 'قيد الانتظار' : 'تم الصرف'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/prescription/${pres.id}`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="عرض التفاصيل"
                          >
                            <ArrowRight size={18} />
                          </Link>
                          {pres.status === 'pending' && (
                            <button
                              onClick={() => handleDispense(pres.id)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="صرف الوصفة"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDashboard;
