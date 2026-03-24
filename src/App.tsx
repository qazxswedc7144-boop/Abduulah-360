import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PersonalAuth from "./components/PersonalAuth";
import FacilityAuth from "./components/FacilityAuth";
import Dashboard from "./components/Dashboard";
import PatientProfile from "./components/PatientProfile";
import FacilityDashboard from "./components/FacilityDashboard";
import LandingPage from "./components/LandingPage";
import MapSystem from "./components/MapSystem";
import AIMedicalAssistant from "./components/AIMedicalAssistant";
import GovernmentDashboard from "./components/GovernmentDashboard";
import MainLayout from "./components/MainLayout";
import Patients from "./components/Patients";
import Prescriptions from "./components/Prescriptions";
import PrescriptionDetail from "./components/PrescriptionDetail";
import CreatePrescription from "./components/CreatePrescription";
import PrescriptionScanner from "./components/PrescriptionScanner";
import HealthCard from "./components/HealthCard";
import { MedicalHistory } from "./components/MedicalHistory";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { MOCK_MEDICAL_RECORDS, MOCK_PATIENTS } from "./mockData";

import AdminDashboard from "./components/admin/AdminDashboard";
import AdminEpidemiology from "./components/admin/AdminEpidemiology";
import AdminMap from "./components/admin/AdminMap";
import AdminReports from "./components/admin/AdminReports";
import AdminUsers from "./components/admin/AdminUsers";
import AdminFacilities from "./components/admin/AdminFacilities";
import AdminLogs from "./components/admin/AdminLogs";
import AdminRoles from "./components/admin/AdminRoles";

import { authService, AuthUser } from "./services/authService";

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token on load
        await authService.refresh();
        setUser(authService.getUser());
      } catch (e) {
        // Not logged in or refresh failed
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const ProtectedRoute = ({ children, title, permission }: { children: React.ReactNode, title?: string, permission?: string }) => {
    if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    
    if (!authService.isAuthenticated()) {
      return <Navigate to="/" />;
    }

    const currentUser = authService.getUser();
    if (permission && currentUser && !currentUser.permissions.includes(permission) && currentUser.role !== 'admin') {
      return <Navigate to="/home" />;
    }

    return <MainLayout role={currentUser?.role || null} title={title}>{children}</MainLayout>;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <Router>
      <div className="min-h-screen font-sans text-slate-900 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/personal" element={<PersonalAuth />} />
            <Route path="/login/facility" element={<FacilityAuth />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute title="لوحة التحكم"><Dashboard role={user?.role || null} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute title="لوحة التحكم الوطنية"><GovernmentDashboard /></ProtectedRoute>} />
            
            <Route path="/health-card" element={<ProtectedRoute title="بطاقتي الصحية"><div className="flex justify-center py-8"><HealthCard patient={MOCK_PATIENTS[0]} /></div></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute title="إدارة المرضى"><Patients /></ProtectedRoute>} />
            <Route path="/patient/:id" element={<ProtectedRoute title="ملف المريض"><PatientProfile /></ProtectedRoute>} />
            <Route path="/labs" element={<ProtectedRoute title="نتائج المختبر"><MedicalHistory records={MOCK_MEDICAL_RECORDS} /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute title="الوصفات الطبية"><Prescriptions /></ProtectedRoute>} />
            <Route path="/prescription/new" element={<ProtectedRoute title="إنشاء وصفة"><CreatePrescription /></ProtectedRoute>} />
            <Route path="/prescription/:id" element={<ProtectedRoute title="تفاصيل الوصفة"><PrescriptionDetail /></ProtectedRoute>} />
            <Route path="/pharmacy/scan" element={<ProtectedRoute title="صرف الوصفات"><PrescriptionScanner /></ProtectedRoute>} />
            <Route path="/radiology" element={<ProtectedRoute title="الأشعة والتحاليل"><MedicalHistory records={MOCK_MEDICAL_RECORDS} /></ProtectedRoute>} />
            <Route path="/vaccination" element={<ProtectedRoute title="سجل التطعيمات"><MedicalHistory records={MOCK_MEDICAL_RECORDS} /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute title="المواعيد"><Dashboard role={user?.role || null} /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute title="الخارطة الصحية"><MapSystem /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute title="المساعد الطبي الذكي"><AIMedicalAssistant /></ProtectedRoute>} />
            <Route path="/facilities" element={<ProtectedRoute title="المنشآت الصحية"><FacilityDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute title="التحليلات الوطنية"><GovernmentDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute title="الملف الشخصي"><Dashboard role={user?.role || null} /></ProtectedRoute>} />
            
            {/* Ministry Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/epidemiology" element={<AdminEpidemiology />} />
            <Route path="/admin/map" element={<AdminMap />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/facilities" element={<AdminFacilities />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
