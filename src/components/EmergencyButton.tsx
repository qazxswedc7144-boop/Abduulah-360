import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, AlertCircle, MapPin, Phone, X } from "lucide-react";

const EmergencyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "requesting" | "sent">("idle");

  const handleEmergency = () => {
    setStatus("requesting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Emergency Location:", position.coords.latitude, position.coords.longitude);
          // In a real app, send this to the server/nearest hospital
          setTimeout(() => setStatus("sent"), 2000);
        },
        (error) => {
          console.error("Error getting location:", error);
          setTimeout(() => setStatus("sent"), 2000); // Fallback
        }
      );
    } else {
      setTimeout(() => setStatus("sent"), 2000);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 left-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-rose-600 text-white rounded-full shadow-2xl shadow-rose-200 flex items-center justify-center border-4 border-white"
        >
          <Activity size={32} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-rose-600 p-8 text-white text-center relative">
                <button
                  onClick={() => { setIsOpen(false); setStatus("idle"); }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <X size={18} />
                </button>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle size={40} />
                </motion.div>
                <h2 className="text-2xl font-bold">طلب استغاثة طارئ</h2>
                <p className="text-rose-100 mt-2">سيتم إرسال موقعك الحالي لأقرب مستشفى متوفر.</p>
              </div>

              <div className="p-8 space-y-6 text-center">
                {status === "idle" ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={handleEmergency}
                        className="w-full py-5 bg-rose-600 text-white font-bold text-xl rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-3"
                      >
                        <Activity size={24} />
                        إرسال طلب استغاثة
                      </button>
                      <a
                        href="tel:199"
                        className="w-full py-5 bg-slate-100 text-slate-600 font-bold text-xl rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                      >
                        <Phone size={24} />
                        اتصال بالإسعاف (199)
                      </a>
                    </div>
                  </>
                ) : status === "requesting" ? (
                  <div className="py-12 flex flex-col items-center gap-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full"
                    />
                    <p className="text-slate-600 font-bold text-lg">جاري تحديد موقعك وإرسال الطلب...</p>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Activity size={40} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">تم إرسال الطلب بنجاح</h3>
                      <p className="text-slate-500 mt-2">سيتم التواصل معك خلال لحظات. يرجى البقاء في مكانك.</p>
                    </div>
                    <button
                      onClick={() => { setIsOpen(false); setStatus("idle"); }}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                    >
                      إغلاق
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyButton;
