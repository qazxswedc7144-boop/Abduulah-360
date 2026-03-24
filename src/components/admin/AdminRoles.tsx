import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Save, 
  RefreshCcw,
  Search,
  Filter,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import AdminLayout from "./AdminLayout";
import { Role, Permission, ROLE_PERMISSIONS, checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminRoles: React.FC = () => {
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
      logAction(mockUser, "access", "roles_management", "access", "Accessed the roles and permissions module");
    }
  }, []);

  if (!checkPermission(mockUser, "manage_users")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Shield size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [editedRole, setEditedRole] = useState<Role>("patient");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc")),
      (snap) => {
        setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsub();
  }, []);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditedRole(user.role);
    setEditedPermissions(user.permissions || []);
    setIsEditing(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        role: editedRole,
        permissions: editedPermissions
      });

      // Log the action
      await addDoc(collection(db, "logs"), {
        type: "permission_change",
        action: `Changed role/permissions for ${selectedUser.email}`,
        details: `New Role: ${editedRole}, Permissions: ${editedPermissions.join(", ")}`,
        userId: selectedUser.id,
        timestamp: new Date().toISOString(),
        ipAddress: "127.0.0.1" // Mock IP
      });

      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  const togglePermission = (perm: string) => {
    setEditedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const allPermissions: Permission[] = [
    'view_patient',
    'create_patient',
    'edit_patient',
    'view_prescription',
    'create_prescription',
    'dispense_medication',
    'upload_lab_result',
    'view_radiology',
    'access_admin_dashboard',
    'view_reports',
    'manage_users',
    'manage_facilities'
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout title="إدارة الصلاحيات والأدوار">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث عن مستخدم..."
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
              <option value="lab_technician">فني مختبر</option>
              <option value="facility_admin">مدير منشأة</option>
              <option value="ministry_admin">مسؤول وزارة</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black">
              <Shield size={16} />
              نظام RBAC نشط
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                قائمة المستخدمين
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">المستخدم</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الدور الحالي</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الصلاحيات الإضافية</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedUser?.id === user.id ? "bg-blue-50/50" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-black text-xs">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-900">{user.name || "مستخدم"}</p>
                            <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions?.length > 0 ? (
                            user.permissions.slice(0, 2).map((p: string) => (
                              <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">افتراضية فقط</span>
                          )}
                          {user.permissions?.length > 2 && (
                            <span className="text-[9px] text-blue-500 font-black">+{user.permissions.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        >
                          <Lock size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Editor */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                محرر الصلاحيات
              </h3>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
              {selectedUser ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">المستخدم المختار</p>
                    <p className="text-sm font-black text-slate-900">{selectedUser.name}</p>
                    <p className="text-xs font-bold text-slate-500">{selectedUser.email}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700">تغيير الدور الوظيفي</label>
                    <select 
                      className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value as Role)}
                    >
                      <option value="patient">مريض</option>
                      <option value="doctor">طبيب</option>
                      <option value="pharmacist">صيدلاني</option>
                      <option value="lab_technician">فني مختبر</option>
                      <option value="facility_admin">مدير منشأة</option>
                      <option value="ministry_admin">مسؤول وزارة</option>
                      <option value="admin">مدير نظام</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">الصلاحيات المخصصة</label>
                      <span className="text-[10px] font-bold text-slate-400">تجاوز الصلاحيات الافتراضية</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {allPermissions.map((perm) => {
                        const isDefault = ROLE_PERMISSIONS[editedRole].includes(perm);
                        const isSelected = editedPermissions.includes(perm) || isDefault;
                        
                        return (
                          <button
                            key={perm}
                            onClick={() => !isDefault && togglePermission(perm)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isSelected 
                                ? "bg-blue-50 border-blue-200 text-blue-700" 
                                : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                            } ${isDefault ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                              <span className="text-[11px] font-bold">{perm.replace(/_/g, " ")}</span>
                            </div>
                            {isDefault && (
                              <span className="text-[9px] font-black bg-blue-100 px-1.5 py-0.5 rounded uppercase">افتراضي</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={handleSavePermissions}
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    حفظ التغييرات
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-12">
                  <Unlock size={48} className="opacity-20" />
                  <p className="text-sm font-bold">اختر مستخدماً لتعديل صلاحياته</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;
