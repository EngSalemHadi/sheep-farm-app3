// مشروع تربية الأغنام — Purchase Tab

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Purchase } from '../lib/types';
import { formatCurrency, formatDate, formatNumber, todayISO } from '../lib/format';
import ConfirmDialog from './ConfirmDialog';

interface PurchaseTabProps {
  purchases: Purchase[];
  onAdd: (input: Omit<Purchase, 'id' | 'totalCost' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export default function PurchaseTab({ purchases, onAdd, onDelete }: PurchaseTabProps) {
  const [form, setForm] = useState({
    date: todayISO(),
    count: '',
    pricePerHead: '',
    source: '',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(form.count);
    const pricePerHead = parseFloat(form.pricePerHead);

    if (!form.date) { toast.error('الرجاء اختيار التاريخ'); return; }
    if (isNaN(count) || count <= 0) { toast.error('الرجاء إدخال عدد صحيح'); return; }
    if (isNaN(pricePerHead) || pricePerHead <= 0) { toast.error('الرجاء إدخال سعر صحيح'); return; }
    if (!form.source.trim()) { toast.error('الرجاء إدخال اسم المصدر'); return; }

    setSubmitting(true);
    onAdd({
      date: form.date,
      count,
      pricePerHead,
      source: form.source.trim(),
    });
    toast.success(`✅ تم تسجيل شراء ${count} رأس بنجاح`);
    setForm({ date: todayISO(), count: '', pricePerHead: '', source: '' });
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
    toast.success('تم حذف سجل الشراء');
  };

  const totalSpent = purchases.reduce((s, p) => s + p.totalCost, 0);
  const totalHeads = purchases.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      {/* Add Purchase Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="farm-card p-4 sm:p-6"
      >
        <h2 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
          <span>🛒</span> إضافة عملية شراء
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
            <label className="block text-sm text-muted-foreground mb-1">عدد الرؤوس *</label>
            <input
              type="number"
              value={form.count}
              onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
              className="farm-input"
              placeholder="مثال: 10"
              min="1"
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
              placeholder="مثال: 500"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">المصدر / البائع *</label>
            <input
              type="text"
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              className="farm-input"
              placeholder="اسم البائع أو المزرعة"
              required
            />
          </div>

          {form.count && form.pricePerHead && (
            <div className="sm:col-span-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">
                الإجمالي: <span className="font-bold text-income text-base">
                  {formatCurrency(parseInt(form.count || '0') * parseFloat(form.pricePerHead || '0'))}
                </span>
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-200"
            >
              {submitting ? 'جاري الحفظ...' : '+ إضافة الشراء'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Summary */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">عدد العمليات</p>
            <p className="font-bold text-lg">{formatNumber(purchases.length)}</p>
          </div>
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي الرؤوس</p>
            <p className="font-bold text-lg text-income">{formatNumber(totalHeads)}</p>
          </div>
          <div className="farm-card p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي التكلفة</p>
            <p className="font-bold text-lg text-expense">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
      )}

      {/* Purchase History */}
      <div className="farm-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-cairo font-bold flex items-center gap-2">
            <span>📋</span> سجل المشتريات
            {purchases.length > 0 && (
              <span className="farm-badge bg-white/10 text-muted-foreground">{purchases.length}</span>
            )}
          </h2>
        </div>

        {purchases.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-4xl block mb-2">🛒</span>
            <p>لا توجد مشتريات مسجلة بعد</p>
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
                  <th className="text-right p-3 text-muted-foreground font-medium">المصدر</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {purchases.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      className="farm-table-row"
                    >
                      <td className="p-3 whitespace-nowrap">{formatDate(p.date)}</td>
                      <td className="p-3 font-bold text-income">{formatNumber(p.count)}</td>
                      <td className="p-3">{formatCurrency(p.pricePerHead)}</td>
                      <td className="p-3 font-bold text-expense">{formatCurrency(p.totalCost)}</td>
                      <td className="p-3 text-muted-foreground max-w-[120px] truncate">{p.source}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setDeleteId(p.id)}
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
        title="حذف سجل الشراء"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
