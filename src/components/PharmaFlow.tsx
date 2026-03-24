import React, { useState } from 'react';
import { PharmaInvoice } from '../types/fhir';
import { FileText, Edit3, Save, X, AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_INVOICES: PharmaInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-03-01',
    customerName: 'صيدلية الأمل',
    totalAmount: 150000,
    notes: 'طلبية أدوية السكر والضغط',
    linkedToFinancialDoc: true,
    items: [{ name: 'Insulin', quantity: 10, price: 5000 }]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-03-05',
    customerName: 'مستشفى اليمن الدولي',
    totalAmount: 450000,
    notes: 'مستلزمات طبية عامة',
    linkedToFinancialDoc: false,
    items: [{ name: 'Gloves', quantity: 100, price: 1000 }]
  }
];

export const PharmaFlow = () => {
  const [invoices, setInvoices] = useState<PharmaInvoice[]>(MOCK_INVOICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PharmaInvoice>>({});

  const startEdit = (invoice: PharmaInvoice) => {
    setEditingId(invoice.id);
    setEditForm({ ...invoice });
  };

  const saveEdit = () => {
    setInvoices(invoices.map(inv => inv.id === editingId ? { ...inv, ...editForm } as PharmaInvoice : inv));
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" dir="rtl">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <FileText size={32} className="text-blue-600" />
          نظام PharmaFlow للمبيعات والمخازن
        </h2>
        <p className="text-slate-500">إدارة الفواتير والربط المالي (قواعد العمل المستقرة)</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم الفاتورة</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">العميل</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">الإجمالي (ريال)</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة المالية</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{invoice.customerName}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{invoice.date}</td>
                <td className="px-6 py-4 font-bold text-blue-600">
                  {editingId === invoice.id ? (
                    <input 
                      type="number"
                      value={editForm.totalAmount}
                      disabled={invoice.linkedToFinancialDoc}
                      onChange={(e) => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })}
                      className={`w-32 px-2 py-1 border rounded-lg outline-none ${invoice.linkedToFinancialDoc ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-500'}`}
                    />
                  ) : (
                    invoice.totalAmount.toLocaleString()
                  )}
                </td>
                <td className="px-6 py-4">
                  {invoice.linkedToFinancialDoc ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                      <LinkIcon size={12} /> مرتبطة بسند مالي
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      غير مرتبطة
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === invoice.id ? (
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(invoice)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit3 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 bg-blue-50 border border-blue-100 rounded-3xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-600 text-white rounded-2xl">
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">تعديل الفاتورة: {editForm.invoiceNumber}</h3>
                <p className="text-slate-500 text-sm">تعديل البيانات وفقاً لصلاحيات النظام</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">إجمالي الفاتورة</label>
                <input 
                  type="number"
                  value={editForm.totalAmount}
                  disabled={invoices.find(i => i.id === editingId)?.linkedToFinancialDoc}
                  onChange={(e) => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                />
                {invoices.find(i => i.id === editingId)?.linkedToFinancialDoc && (
                  <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> يمنع تعديل الإجمالي لأن الفاتورة مرتبطة بسند مالي.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات إضافية</label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all"
                  placeholder="أضف ملاحظاتك هنا..."
                />
                <p className="text-[10px] text-blue-500 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> يسمح دائماً بتعديل الملاحظات.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
