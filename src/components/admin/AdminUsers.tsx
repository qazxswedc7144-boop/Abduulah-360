import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  updateDoc, 
  doc,
  orderBy
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminUsers: React.FC = () => {
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
    if (checkPermission(mockUser, "manage_users")) {
      logAction(mockUser, "access", "user_management", "access", "Accessed the user management module");
    }
  }, []);

  if (!checkPermission(mockUser, "manage_users")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <ShieldAlert size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc")),
      (snap) => {
        setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roles: any = {
      doctor: { label: "طبيب", color: "blue" },
      patient: { label: "مريض", color: "emerald" },
      pharmacist: { label: "صيدلاني", color: "purple" },
      admin: { label: "مدير نظام", color: "amber" },
      ministry_admin: { label: "مسؤول وزارة", color: "rose" },
    };
    const r = roles[role] || { label: role, color: "slate" };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-${r.color}-100 text-${r.color}-600`}>
        {r.label}
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة المستخدمين والصلاحيات">
      <div className="space-y-8">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "إجمالي المستخدمين", value: users.length, icon: Users, color: "blue" },
            { label: "الأطباء", value: users.filter(u => u.role === "doctor").length, icon: ShieldCheck, color: "emerald" },
            { label: "المرضى", value: users.filter(u => u.role === "patient").length, icon: Users, color: "indigo" },
            { label: "غير نشط", value: users.filter(u => u.status === "inactive").length, icon: ShieldAlert, color: "rose" },
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

        {/* User Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث عن مستخدم (الاسم أو البريد)..."
                  className="w-full bg-slate-50 border-transparent rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-50 border-transparent rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">كافة الأدوار</option>
                <option value="doctor">أطباء</option>
                <option value="patient">مرضى</option>
                <option value="pharmacist">صيادلة</option>
                <option value="admin">مدراء نظام</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
              <UserPlus size={18} />
              إضافة مستخدم
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المستخدم</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الدور</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المنطقة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ الانضمام</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-slate-900">{user.name || "مستخدم غير معروف"}</p>
                          <p className="text-xs font-bold text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {user.region || "غير محدد"}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${
                        user.status === "inactive" ? "text-rose-600" : "text-emerald-600"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === "inactive" ? "bg-rose-600" : "bg-emerald-600"}`} />
                        {user.status === "inactive" ? "غير نشط" : "نشط"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-YE") : "---"}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          className={`p-2 rounded-lg transition-all ${
                            user.status === "inactive" 
                              ? "text-emerald-600 hover:bg-emerald-50" 
                              : "text-rose-600 hover:bg-rose-50"
                          }`}
                          title={user.status === "inactive" ? "تفعيل" : "تعطيل"}
                        >
                          {user.status === "inactive" ? <UserCheck size={18} /> : <UserX size={18} />}
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
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

export default AdminUsers;
