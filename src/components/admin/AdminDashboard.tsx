import React, { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  Stethoscope, 
  Calendar, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity as ActivityIcon
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const AdminDashboard: React.FC = () => {
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
    if (checkPermission(mockUser, "access_admin_dashboard")) {
      logAction(mockUser, "access", "admin_dashboard", "access", "Accessed the main admin dashboard");
    }
  }, []);

  if (!checkPermission(mockUser, "access_admin_dashboard")) {
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

  const [stats, setStats] = useState({
    patients: 0,
    facilities: 0,
    doctors: 0,
    visitsToday: 0,
    prescriptionsToday: 0,
    emergencyCases: 0
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [visitTrends, setVisitTrends] = useState<any[]>([]);

  useEffect(() => {
    // Real-time stats
    const unsubPatients = onSnapshot(collection(db, "citizens"), (snap) => {
      setStats(prev => ({ ...prev, patients: snap.size }));
    });

    const unsubFacilities = onSnapshot(collection(db, "facilities"), (snap) => {
      setStats(prev => ({ ...prev, facilities: snap.size }));
    });

    const unsubDoctors = onSnapshot(
      query(collection(db, "users"), where("role", "==", "doctor")),
      (snap) => {
        setStats(prev => ({ ...prev, doctors: snap.size }));
      }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = Timestamp.fromDate(today);

    const unsubVisits = onSnapshot(
      query(collection(db, "visits"), where("timestamp", ">=", todayStart.toDate().toISOString())),
      (snap) => {
        setStats(prev => ({ ...prev, visitsToday: snap.size }));
        const emergencies = snap.docs.filter(doc => doc.data().type === "emergency").length;
        setStats(prev => ({ ...prev, emergencyCases: emergencies }));
      }
    );

    const unsubPrescriptions = onSnapshot(
      query(collection(db, "prescriptions"), where("issuedAt", ">=", todayStart.toDate().toISOString())),
      (snap) => {
        setStats(prev => ({ ...prev, prescriptionsToday: snap.size }));
      }
    );

    // Real-time activities
    const unsubActivities = onSnapshot(
      query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(10)),
      (snap) => {
        setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Mock visit trends for the chart
    setVisitTrends([
      { name: "السبت", visits: 450, emergencies: 45 },
      { name: "الأحد", visits: 520, emergencies: 52 },
      { name: "الاثنين", visits: 610, emergencies: 68 },
      { name: "الثلاثاء", visits: 580, emergencies: 55 },
      { name: "الأربعاء", visits: 640, emergencies: 72 },
      { name: "الخميس", visits: 720, emergencies: 85 },
      { name: "الجمعة", visits: 380, emergencies: 30 },
    ]);

    return () => {
      unsubPatients();
      unsubFacilities();
      unsubDoctors();
      unsubVisits();
      unsubPrescriptions();
      unsubActivities();
    };
  }, []);

  const statCards = [
    { label: "إجمالي المرضى", value: stats.patients, icon: Users, color: "blue", trend: "+12%" },
    { label: "المنشآت الصحية", value: stats.facilities, icon: Building2, color: "emerald", trend: "+2" },
    { label: "الأطباء المعتمدون", value: stats.doctors, icon: Stethoscope, color: "indigo", trend: "+5%" },
    { label: "زيارات اليوم", value: stats.visitsToday, icon: Calendar, color: "amber", trend: "+18%" },
    { label: "وصفات اليوم", value: stats.prescriptionsToday, icon: FileText, color: "purple", trend: "+24%" },
    { label: "حالات الطوارئ", value: stats.emergencyCases, icon: AlertTriangle, color: "rose", trend: "-4%" },
  ];

  return (
    <AdminLayout title="لوحة التحكم الرئيسية">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-100 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${stat.trend.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>
                  {stat.trend}
                  {stat.trend.startsWith("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value.toLocaleString()}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">تحليلات الزيارات الأسبوعية</h3>
                <p className="text-xs text-slate-500 font-bold">مقارنة بين الزيارات العامة وحالات الطوارئ</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600">زيارات عامة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600">طوارئ</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitTrends}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmergencies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="emergencies" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorEmergencies)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <ActivityIcon size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900">النشاط المباشر</h3>
              </div>
              <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                مباشر
              </span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activity.type === "emergency" ? "bg-rose-100 text-rose-600" :
                        activity.type === "new_patient" ? "bg-blue-100 text-blue-600" :
                        activity.type === "new_prescription" ? "bg-emerald-100 text-emerald-600" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {activity.type === "emergency" ? <AlertTriangle size={18} /> :
                         activity.type === "new_patient" ? <Users size={18} /> :
                         activity.type === "new_prescription" ? <FileText size={18} /> :
                         <Clock size={18} />}
                      </div>
                      {i !== activities.length - 1 && <div className="w-px flex-1 bg-slate-100" />}
                    </div>
                    <div className="space-y-1 pb-6">
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(activity.timestamp).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>•</span>
                        <span>{activity.facilityName || "منشأة عامة"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-12">
                  <ActivityIcon size={48} className="opacity-20" />
                  <p className="text-sm font-bold">لا يوجد نشاط حالياً</p>
                </div>
              )}
            </div>

            <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all">
              عرض كافة الأنشطة
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
