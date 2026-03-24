import React, { useState, useEffect, useCallback } from "react";
import { 
  GoogleMap, 
  useJsApiLoader, 
  Marker, 
  InfoWindow 
} from "@react-google-maps/api";
import { 
  collection, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Building2, 
  Users, 
  Activity, 
  AlertTriangle, 
  Search, 
  Filter,
  Navigation,
  Info,
  Map as MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdminLayout from "./AdminLayout";
import { checkPermission } from "../../lib/rbac";
import { logAction } from "../../lib/logger";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  borderRadius: "32px",
};

const center = {
  lat: 15.3694,
  lng: 44.1910, // Sana'a, Yemen
};

const AdminMap: React.FC = () => {
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
    if (checkPermission(mockUser, "view_reports")) {
      logAction(mockUser, "access", "national_map", "access", "Accessed the national health map");
    }
  }, []);

  if (!checkPermission(mockUser, "view_reports")) {
    return (
      <AdminLayout title="غير مصرح">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <MapIcon size={64} className="text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">وصول غير مصرح به</h2>
          <p className="text-slate-500 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        </div>
      </AdminLayout>
    );
  }

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "facilities"), (snap) => {
      const data = snap.docs.map(doc => {
        const facility = doc.data();
        // Mock status based on load (random for demo)
        const load = Math.floor(Math.random() * 100);
        const status = load > 85 ? "red" : load > 60 ? "yellow" : "green";
        return { 
          id: doc.id, 
          ...facility, 
          load, 
          status,
          capacity: 500 + Math.floor(Math.random() * 500),
          patientCount: Math.floor((load / 100) * (500 + Math.floor(Math.random() * 500)))
        };
      });
      setFacilities(data);
    });

    return () => unsub();
  }, []);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getMarkerIcon = (status: string) => {
    const color = status === "red" ? "#f43f5e" : status === "yellow" ? "#f59e0b" : "#10b981";
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#ffffff",
      scale: 2,
      anchor: new google.maps.Point(12, 22),
    };
  };

  return (
    <AdminLayout title="الخارطة الصحية الوطنية">
      <div className="space-y-6">
        {/* Map Controls */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث عن منشأة..."
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
              <option value="all">كافة المنشآت</option>
              <option value="hospital">مستشفيات</option>
              <option value="clinic">عيادات</option>
              <option value="pharmacy">صيدليات</option>
              <option value="lab">مختبرات</option>
            </select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs font-bold text-slate-600">طبيعي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-xs font-bold text-slate-600">متوسط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-xs font-bold text-slate-600">مزدحم</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                styles: [
                  {
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#64748b" }]
                  },
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#e2e8f0" }]
                  }
                ],
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {filteredFacilities.map((facility) => (
                <Marker
                  key={facility.id}
                  position={{
                    lat: facility.location?.latitude || facility.location?._lat || center.lat,
                    lng: facility.location?.longitude || facility.location?._long || center.lng,
                  }}
                  icon={getMarkerIcon(facility.status)}
                  onClick={() => setSelectedFacility(facility)}
                />
              ))}

              {selectedFacility && (
                <InfoWindow
                  position={{
                    lat: selectedFacility.location?.latitude || selectedFacility.location?._lat || center.lat,
                    lng: selectedFacility.location?.longitude || selectedFacility.location?._long || center.lng,
                  }}
                  onCloseClick={() => setSelectedFacility(null)}
                >
                  <div className="p-4 min-w-[240px] text-right space-y-4" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedFacility.status === "red" ? "bg-rose-100 text-rose-600" :
                        selectedFacility.status === "yellow" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-900">{selectedFacility.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedFacility.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users size={14} />
                          <span className="text-[10px] font-bold">المرضى</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{selectedFacility.patientCount}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Activity size={14} />
                          <span className="text-[10px] font-bold">السعة</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{selectedFacility.capacity}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black">
                        <span className="text-slate-500">مستوى الإشغال</span>
                        <span className={
                          selectedFacility.load > 85 ? "text-rose-600" :
                          selectedFacility.load > 60 ? "text-amber-600" :
                          "text-emerald-600"
                        }>{selectedFacility.load}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            selectedFacility.load > 85 ? "bg-rose-500" :
                            selectedFacility.load > 60 ? "bg-amber-500" :
                            "bg-emerald-500"
                          }`}
                          style={{ width: `${selectedFacility.load}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                      <Navigation size={14} />
                      عرض التفاصيل الكاملة
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-[calc(100vh-200px)] bg-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm font-black">جاري تحميل الخارطة الوطنية...</p>
            </div>
          )}

          {/* Map Overlay Stats */}
          <div className="absolute bottom-8 right-8 left-8 flex flex-wrap gap-4 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl pointer-events-auto flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-500 font-black">منشآت مزدحمة</p>
                <p className="text-lg font-black text-slate-900">12</p>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl pointer-events-auto flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-500 font-black">إجمالي المنشآت</p>
                <p className="text-lg font-black text-slate-900">{facilities.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMap;
