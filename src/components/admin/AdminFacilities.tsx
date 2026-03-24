import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Users, 
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminFacilities: React.FC = () => {
  // Mock user for permission check (in real app, get from auth context)
  const mockUser = {
    uid: "mock-user-id",
    email: "admin@health.gov.ye",
    role: "admin" as any,
    permissions: [
      "access_admin_dashboard",
      "view_reports",
      "manage_users",
      "manage_facilities"
    ] as any
  };

  useEffect(() => {
    if (checkPermission(mockUser, "manage_facilities")) {
      logAction(mockUser, "access", "facility_management", "access", "Accessed the facility management module");
    }
  }, []);

  if (!checkPermission(mockUser, "manage_facilities")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <AlertTriangle size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [facilities, setFacilities] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "facilities"), orderBy("createdAt", "desc")),
      (snap) => {
        setFacilities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const updateFacilityStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "facilities", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating facility status:", error);
    }
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (f.licenseNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statuses: any = {
      approved: { label: "معتمد", color: "emerald", icon: CheckCircle2 },
      pending: { label: "قيد المراجعة", color: "amber", icon: Clock },
      rejected: { label: "مرفوض", color: "rose", icon: XCircle },
      suspended: { label: "موقوف مؤقتاً", color: "slate", icon: AlertTriangle },
    };
    const s = statuses[status] || { label: status, color: "slate", icon: Activity };
    return (
      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-${s.color}-600`}>
        <s.icon size={14} />
        {s.label}
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة المنشآت الصحية">
      <div className="space-y-8">
        {/* Facility Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "إجمالي المنشآت", value: facilities.length, icon: Building2, color: "blue" },
            { label: "مستشفيات", value: facilities.filter(f => f.type === "hospital").length, icon: Activity, color: "emerald" },
            { label: "قيد المراجعة", value: facilities.filter(f => f.status === "pending").length, icon: Clock, color: "amber" },
            { label: "تنبيهات السعة", value: 3, icon: AlertTriangle, color: "rose" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Facility Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث عن منشأة (الاسم أو الترخيص)..."
                  className="w-full bg-slate-50 border-transparent rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-50 border-transparent rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">كافة الأنواع</option>
                <option value="hospital">مستشفيات</option>
                <option value="clinic">عيادات</option>
                <option value="pharmacy">صيدليات</option>
                <option value="lab">مختبرات</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20">
              <Plus size={18} />
              إضافة منشأة
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المنشأة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">النوع</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الموقع</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الإشغال</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <Building2 size={20} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-slate-900">{facility.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">رقم الترخيص: {facility.licenseNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {facility.type}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {facility.region || "غير محدد"}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      {getStatusBadge(facility.status)}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className={`h-full bg-blue-500 rounded-full`}
                            style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400">نشط</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        {facility.status === "pending" && (
                          <>
                            <button 
                              onClick={() => updateFacilityStatus(facility.id, "approved")}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="اعتماد"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => updateFacilityStatus(facility.id, "rejected")}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="رفض"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFacilities;
