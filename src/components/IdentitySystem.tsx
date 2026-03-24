import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  where,
  getDocs
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Fingerprint, 
  Phone, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  IdCard,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Citizen {
  id: string;
  nationalId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  healthId: string;
  biometricHash?: string;
  createdAt: any;
}

const IdentitySystem: React.FC = () => {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nationalId: "",
    fullName: "",
    dateOfBirth: "",
    gender: "ذكر",
    phone: "",
    biometricHash: ""
  });

  useEffect(() => {
    const q = query(collection(db, "citizens"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const citizensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Citizen[];
      setCitizens(citizensData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching citizens:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateHealthId = () => {
    return "YEM-HLTH-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Check if nationalId already exists
      const q = query(collection(db, "citizens"), where("nationalId", "==", formData.nationalId));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        setError("الرقم الوطني مسجل مسبقاً في النظام");
        return;
      }

      const healthId = generateHealthId();
      const citizenData = {
        ...formData,
        healthId,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid
      };
      
      await addDoc(collection(db, "citizens"), citizenData);
      
      // Create initial health record
      await addDoc(collection(db, "health_records"), {
        patientId: healthId,
        nationalId: formData.nationalId,
        records: [],
        prescriptions: [],
        visits: [],
        lastSync: new Date().toISOString(),
        region: "Sana'a" // Default to primary node
      });

      setIsAddModalOpen(false);
      setFormData({
        nationalId: "",
        fullName: "",
        dateOfBirth: "",
        gender: "ذكر",
        phone: "",
        biometricHash: ""
      });
    } catch (err) {
      console.error("Error adding citizen:", err);
      setError("حدث خطأ أثناء تسجيل الهوية الرقمية");
    }
  };

  const filteredCitizens = citizens.filter(c => 
    c.fullName.includes(searchTerm) || 
    c.nationalId.includes(searchTerm) || 
    c.healthId.includes(searchTerm)
  );

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display">نظام الهوية الرقمية الوطنية</h1>
          <p className="text-slate-400 font-medium mt-1">إدارة السجل الوطني الموحد للمواطنين</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          تسجيل هوية جديدة
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="البحث بالاسم، الرقم الوطني، أو الهوية الصحية..."
            className="w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-6 py-4 bg-indigo-500/10 text-indigo-400 rounded-2xl font-bold border border-indigo-500/20">
          <Users size={20} />
          {citizens.length} مواطن مسجل
        </div>
      </div>

      {/* Citizens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold">جاري تحميل السجل الوطني...</p>
            </div>
          ) : filteredCitizens.map((citizen, index) => (
            <motion.div
              key={citizen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card glass-card-hover group overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-indigo-500/20">
                    <IdCard size={32} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20">
                    <ShieldCheck size={12} />
                    هوية موثقة
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-2 font-display">{citizen.fullName}</h3>
                <p className="text-indigo-400 text-sm font-bold mb-6">{citizen.healthId}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-medium">{citizen.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Phone size={16} />
                    </div>
                    <span className="text-sm font-medium">{citizen.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Fingerprint size={16} />
                    </div>
                    <span className="text-sm font-medium">الرقم الوطني: {citizen.nationalId}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-white/5 text-white font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all border border-white/10">
                  عرض الملف الصحي الموحد
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Citizen Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-2xl font-black text-white font-display">تسجيل هوية رقمية جديدة</h2>
                  <p className="text-slate-400 font-medium">إصدار معرف صحي وطني موحد</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCitizen} className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">الاسم الكامل</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
                      placeholder="الاسم الرباعي كما في البطاقة"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">الرقم الوطني (11 رقم)</label>
                    <input 
                      required
                      type="text"
                      maxLength={11}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
                      placeholder="00000000000"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">تاريخ الميلاد</label>
                    <input 
                      required
                      type="date"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">الجنس</label>
                    <select 
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white appearance-none"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="ذكر" className="bg-slate-900">ذكر</option>
                      <option value="أنثى" className="bg-slate-900">أنثى</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white"
                      placeholder="7XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-300 mr-2">البصمة الحيوية (اختياري)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        readOnly
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-medium text-slate-500"
                        placeholder="جاري انتظار المسح..."
                      />
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95"
                  >
                    تأكيد وإصدار الهوية الصحية
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-5 bg-white/5 text-slate-300 font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10"
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

export default IdentitySystem;
