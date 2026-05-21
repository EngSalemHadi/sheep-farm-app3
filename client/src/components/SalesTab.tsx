// مشروع تربية الأغنام — Sales Tab

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Sale } from '../lib/types';
import { formatCurrency, formatDate, formatNumber, todayISO } from '../lib/format';
import ConfirmDialog from './ConfirmDialog';

interface SalesTabProps {
  sales: Sale[];
  currentOwned: number;
  onAdd: (input: Omit<Sale, 'id' | 'totalRevenue' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export default function SalesTab({ sales, currentOwned, onAdd, onDelete }: SalesTabProps) {
  const [form, setForm] = useState({
    date: todayISO(),
    count: '',
    pricePerHead: '',
    buyer: '',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(form.count);
    const pricePerHead = parseFloat(form.pricePerHead);

    if (!form.date) { toast.error('الرجاء اختيار التاريخ'); return; }
    if (isNaN(count) || count <= 0) { toast.error('الرجاء إدخال عدد صحيح'); return; }
    if (count > currentOwned) { toast.error(`لا يمكن بيع أكثر من ${currentOwned} رأس متاح`); return; }
    if (isNaN(pricePerHead) || pricePerHead <= 0) { toast.error('الرجاء إدخال سعر صحيح'); return; }
    if (!form.buyer.trim()) { toast.error('الرجاء إدخال اسم المشتري'); return; }

    setSubmitting(true);
    onAdd({
      date: form.date,
      count,
      pricePerHead,
      buyerName: form.buyer.trim(),
    });
    toast.success(`✅ تم تسجيل بيع ${count} رأس بنجاح`);
    setForm({ date: todayISO(), count: '', pricePerHead: '', buyer: '' });
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
    toast.success('تم حذف سجل البيع');
  };

  const totalRevenue = sales.reduce((s, p) => s + p.totalRevenue, 0);
  const totalHeads = sales.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      {/* Current Stock Alert */}
      {currentOwned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="farm-card p-3 border-green-500/20 bg-green-500/5 flex items-center gap-2"
        >
          <span>🐑</span>
          <p className="text-sm">
            <span className="text-muted-foreground">المتاح للبيع: </span>
            <span className="font-bold text-income">{formatNumber(currentOwned)} رأس</span>
          </p>
        </motion.div>
      )}

      {/* Add Sale Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="farm-card p-4 sm:p-6"
      >
        <h2 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
          <span>💰</span> إضافة عملية بيع
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">التاريخ *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="farm-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              عدد الرؤوس * {currentOwned > 0 && (
                <span className="text-xs text-muted-foreground">(المتاح: {formatNumber(currentOwned)})</span>
              )}
            </label>
            <input
              type="number"
              value={form.count}
              onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
              className="farm-input"
              placeholder="مثال: 5"
              min="1"
              max={currentOwned}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">السعر للرأس الواحد (ر.س) *</label>
            <input
              type="number"
              value={form.pricePerHead}
              onChange={e => setForm(f => ({ ...f, pricePerHead: e.target.value }))}
              className="farm-input"
              placeholder="مثال: 700"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">اسم المشتري *</label>
            <input
              type="text"
              value={form.buyer}
              onChange={e => setForm(f => ({ ...f, buyer: e.target.value }))}
              className="farm-input"
              placeholder="اسم المشتري"
              required
            />
          </div>

          {form.count && form.pricePerHead && (
            <div className="sm:col-span-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">
                الإيراد: <span className="font-bold text-income text-base">
                  {formatCurrency(parseInt(form.count || '0') * parseFloat(form.pricePerHead || '0'))}
                </span>
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting || currentOwned === 0}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-200"
            >
              {submitting ? 'جاري الحفظ...' : '+ إضافة البيع'}
            </button>
            {currentOwned === 0 && (
              <p className="text-xs text-expense mt-2">لا يوجد رؤوس متاحة للبيع</p>
            )}
          </div>
        </form>
      </motion.div>

      {/* Summary */}
      {sales.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">عدد العمليات</p>
            <p className="font-bold text-lg">{formatNumber(sales.length)}</p>
          </div>
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي الرؤوس</p>
            <p className="font-bold text-lg text-expense">{formatNumber(totalHeads)}</p>
          </div>
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي الإيراد</p>
            <p className="font-bold text-lg text-income">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Sales History */}
      <div className="farm-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-cairo font-bold flex items-center gap-2">
            <span>📋</span> سجل المبيعات
            {sales.length > 0 && (
              <span className="farm-badge bg-white/10 text-muted-foreground">{sales.length}</span>
            )}
          </h2>
        </div>

        {sales.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-4xl block mb-2">💰</span>
            <p>لا توجد مبيعات مسجلة بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right p-3 text-muted-foreground font-medium">التاريخ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">العدد</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">السعر/رأس</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الإجمالي</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">المشتري</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {sales.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      className="farm-table-row"
                    >
                      <td className="p-3 whitespace-nowrap">{formatDate(s.date)}</td>
                      <td className="p-3 font-bold text-expense">{formatNumber(s.count)}</td>
                      <td className="p-3">{formatCurrency(s.pricePerHead)}</td>
                      <td className="p-3 font-bold text-income">{formatCurrency(s.totalRevenue)}</td>
                      <td className="p-3 text-muted-foreground max-w-[120px] truncate">{s.buyerName}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/10"
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف سجل البيع"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
