import React from 'react';
import QRCode from 'react-qr-code';
import { Shield, Droplet, Phone, MapPin, Calendar } from 'lucide-react';
import { Patient } from '../mockData';
import { motion } from 'motion/react';

interface HealthCardProps {
  patient: Patient;
}

const HealthCard: React.FC<HealthCardProps> = ({ patient }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100"
      id="health-card"
    >
      {/* Header */}
      <div className="bg-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80">الجمهورية اليمنية</h2>
            <h1 className="text-lg font-black">البطاقة الصحية الوطنية</h1>
          </div>
          <Shield className="w-8 h-8 text-emerald-200" />
        </div>
        <div className="mt-8 relative z-10">
          <p className="text-xs opacity-80 mb-1">الاسم الكامل</p>
          <p className="text-xl font-bold leading-tight">{patient.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">رقم الهوية الصحية (YHID)</p>
              <p className="text-lg font-mono font-bold text-emerald-700">{patient.yhid}</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">فصيلة الدم</p>
                <div className="flex items-center gap-1 text-red-600 font-bold">
                  <Droplet className="w-4 h-4" />
                  <span>{patient.bloodType}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">الجنس</p>
                <p className="font-bold text-gray-700">{patient.gender}</p>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="bg-white p-2 rounded-xl border-2 border-emerald-50 shadow-inner">
            <QRCode value={patient.yhid} size={96} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold">العمر</p>
              <p className="text-sm font-bold">{patient.age} سنة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold">رقم التواصل</p>
              <p className="text-sm font-bold">{patient.phone}</p>
            </div>
          </div>
        </div>

        {patient.emergencyContact && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-[10px] text-red-600 font-black uppercase tracking-wider">اتصال الطوارئ</p>
            </div>
            <p className="text-sm font-bold text-red-900">{patient.emergencyContact}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-400 text-[10px] justify-center pt-2">
          <MapPin className="w-3 h-3" />
          <span>{patient.address}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
        <p className="text-[9px] text-gray-400 font-medium">
          هذه البطاقة معتمدة من وزارة الصحة العامة والسكان - الجمهورية اليمنية
        </p>
      </div>
    </motion.div>
  );
};

export default HealthCard;
