import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Hospital, 
  Pill, 
  FlaskConical, 
  Radio, 
  Search, 
  Filter, 
  Star, 
  ChevronRight, 
  LocateFixed,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MOCK_CLINICS } from "../mockData";

// Haversine formula to calculate distance between two points in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

interface Facility {
  id: string;
  name: string;
  type: "hospital" | "pharmacy" | "lab" | "radiology" | "clinic";
  location: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  rating: number;
  distance?: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 73px)",
};

const defaultCenter = {
  lat: 15.3694, // Sana'a
  lng: 44.1910,
};

const MapSystem: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGeoError(null);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          // Default to Sana'a if geolocation fails
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Fetch facilities from mock data
  useEffect(() => {
    const data = MOCK_CLINICS.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type.includes('مستشفى') ? 'hospital' : 'clinic',
      location: {
        latitude: c.lat,
        longitude: c.lng
      },
      phone: c.phone,
      rating: 4.5 + Math.random() * 0.5
    })) as Facility[];
    setFacilities(data);
  }, []);

  // Filter and calculate distances
  useEffect(() => {
    let result = [...facilities];

    if (userLocation) {
      result = result.map(f => ({
        ...f,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          f.location.latitude,
          f.location.longitude
        )
      }));
    }

    if (filter !== "all") {
      result = result.filter(f => f.type === filter);
    }

    if (searchTerm) {
      result = result.filter(f => f.name.includes(searchTerm));
    }

    // Sort by distance if location available
    if (userLocation) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredFacilities(result);
  }, [facilities, filter, searchTerm, userLocation]);

  const nearestFacilities = useMemo(() => {
    return filteredFacilities.slice(0, 5);
  }, [filteredFacilities]);

  const getIcon = (type: string) => {
    switch (type) {
      case "hospital": return <Hospital className="text-rose-500" size={20} />;
      case "pharmacy": return <Pill className="text-emerald-500" size={20} />;
      case "lab": return <FlaskConical className="text-amber-500" size={20} />;
      case "radiology": return <Radio className="text-purple-500" size={20} />;
      default: return <MapPin className="text-blue-500" size={20} />;
    }
  };

  const handleNavigate = (f: Facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.location.latitude},${f.location.longitude}`;
    window.open(url, "_blank");
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-gov-blue mx-auto" size={48} />
          <p className="font-black text-slate-500">جاري تحميل الخريطة الوطنية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-73px)] w-full overflow-hidden" dir="rtl">
      {/* Floating Search & Filter */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="البحث عن منشأة صحية..."
            className="w-full pr-12 pl-4 py-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl focus:ring-2 focus:ring-gov-blue transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {[
            { id: "all", label: "الكل" },
            { id: "hospital", label: "مستشفيات" },
            { id: "pharmacy", label: "صيدليات" },
            { id: "lab", label: "مختبرات" },
            { id: "radiology", label: "أشعة" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-3 rounded-xl font-black text-sm whitespace-nowrap transition-all shadow-lg ${
                filter === f.id 
                  ? "bg-gov-blue text-white" 
                  : "bg-white/90 backdrop-blur-md text-slate-600 hover:bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Error Alert */}
      <AnimatePresence>
        {geoError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-32 left-6 right-6 z-20"
          >
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 shadow-xl">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <p className="text-sm font-black text-rose-900">{geoError}</p>
              <button 
                onClick={() => setGeoError(null)}
                className="mr-auto p-2 hover:bg-rose-100 rounded-lg text-rose-400"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={13}
        options={{
          disableDefaultUI: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#004a99",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 8,
            }}
          />
        )}

        {/* Facility Markers */}
        {filteredFacilities.map((f) => (
          <Marker
            key={f.id}
            position={{ lat: f.location.latitude, lng: f.location.longitude }}
            onClick={() => setSelectedFacility(f)}
            icon={{
              url: `https://maps.google.com/mapfiles/ms/icons/${
                f.type === 'hospital' ? 'red' : 
                f.type === 'pharmacy' ? 'green' : 
                f.type === 'lab' ? 'yellow' : 'purple'
              }-dot.png`
            }}
          />
        ))}

        {selectedFacility && (
          <InfoWindow
            position={{ 
              lat: selectedFacility.location.latitude, 
              lng: selectedFacility.location.longitude 
            }}
            onCloseClick={() => setSelectedFacility(null)}
          >
            <div className="p-2 min-w-[200px] text-right" dir="rtl">
              <h3 className="font-black text-slate-900">{selectedFacility.name}</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {selectedFacility.type === 'hospital' ? 'مستشفى' : 
                 selectedFacility.type === 'pharmacy' ? 'صيدلية' : 
                 selectedFacility.type === 'lab' ? 'مختبر' : 'مركز أشعة'}
              </p>
              <div className="flex items-center gap-1 mt-2 text-amber-500">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-black">{selectedFacility.rating}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleNavigate(selectedFacility)}
                  className="flex-1 py-2 bg-gov-blue text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1"
                >
                  <Navigation size={12} />
                  اتجاهات
                </button>
                <button 
                  onClick={() => handleCall(selectedFacility.phone)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black flex items-center justify-center gap-1"
                >
                  <Phone size={12} />
                  اتصال
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Bottom Sheet / Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="absolute bottom-24 left-6 w-14 h-14 bg-gov-blue text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-blue-800 transition-all active:scale-95 z-10"
      >
        <LocateFixed size={28} />
      </button>

      {/* Nearest Facilities Sidebar/Sheet */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-20"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-2xl z-30 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">أقرب منشآت صحية لك</h2>
                  <p className="text-xs text-slate-500 font-bold">بناءً على موقعك الحالي</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {nearestFacilities.map((f) => (
                  <div 
                    key={f.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-gov-blue transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedFacility(f);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {getIcon(f.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{f.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-gov-blue bg-gov-blue-light px-2 py-0.5 rounded-md">
                            {f.distance?.toFixed(1)} كم
                          </span>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-black">{f.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(f);
                      }}
                      className="p-3 bg-white text-gov-blue rounded-xl shadow-sm hover:bg-gov-blue hover:text-white transition-all"
                    >
                      <Navigation size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-4 bg-white text-slate-600 font-black rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                >
                  العودة للوحة التحكم
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <button 
        onClick={() => navigate("/dashboard")}
        className="absolute bottom-6 right-6 w-14 h-14 bg-white text-slate-600 rounded-2xl shadow-2xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 z-10 border border-slate-200"
      >
        <ChevronRight size={28} className="rotate-180" />
      </button>
    </div>
  );
};

export default MapSystem;
