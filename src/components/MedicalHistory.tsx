import React, { useState, useMemo, useEffect } from 'react';
import { MedicalRecord } from '../types/fhir';
import { 
  Search, 
  Calendar, 
  User, 
  Stethoscope, 
  Pill, 
  ArrowUpDown, 
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MedicalHistoryProps {
  records: MedicalRecord[];
}

export const MedicalHistory: React.FC<MedicalHistoryProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.diagnosis?.toLowerCase() || "").includes(lowerSearch) ||
          (r.doctorName?.toLowerCase() || "").includes(lowerSearch) ||
          (r.hospitalName?.toLowerCase() || "").includes(lowerSearch)
      );
    }

    if (filterType !== 'all') {
      result = result.filter((r) => r.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [records, searchTerm, sortOrder, filterType]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);
  const paginatedRecords = filteredAndSortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm" dir="rtl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={24} className="text-blue-600" />
            السجل الطبي المفصل
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="بحث في التشخيص أو الطبيب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <ArrowUpDown size={16} />
              {sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
            </button>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="Condition">تشخيص</option>
              <option value="Observation">فحص</option>
              <option value="Procedure">إجراء</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">الطبيب</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">التشخيص</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">الوصفة الطبية</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">المنشأة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {paginatedRecords.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} className="text-blue-500" />
                      <span className="text-sm font-medium">
                        {new Date(record.date).toLocaleDateString('ar-YE')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{record.doctorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-rose-500" />
                      <span className="text-sm font-bold text-slate-900">{record.diagnosis}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Pill size={14} className="text-emerald-500" />
                      <span className="text-sm text-slate-600 italic">{record.prescription}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      {record.hospitalName}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {filteredAndSortedRecords.length === 0 && (
          <div className="py-20 text-center">
            <Filter size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">لا توجد سجلات تطابق البحث</p>
          </div>
        )}

        {filteredAndSortedRecords.length > itemsPerPage && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              عرض <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> إلى <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length)}</span> من أصل <span className="font-bold text-slate-900">{filteredAndSortedRecords.length}</span> سجل
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-bold text-sm transition-all",
                      currentPage === page 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
