// مشروع تربية الأغنام — Expenses Tab

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Expense, ExpenseCategory } from '../lib/types';
import { formatCurrency, formatDate, formatNumber, todayISO } from '../lib/format';
import ConfirmDialog from './ConfirmDialog';

interface ExpensesTabProps {
  expenses: Expense[];
  onAdd: (input: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { value: 'علف', label: 'علف', icon: '🌾', color: '#22c55e' },
  { value: 'حبوب', label: 'حبوب', icon: '🌽', color: '#f59e0b' },
  { value: 'دواء', label: 'دواء', icon: '💊', color: '#3b82f6' },
  { value: 'أخرى', label: 'أخرى', icon: '📦', color: '#8b5cf6' },
];

export default function ExpensesTab({ expenses, onAdd, onDelete }: ExpensesTabProps) {
  const [form, setForm] = useState({
    date: todayISO(),
    amount: '',
    category: 'علف' as ExpenseCategory,
    notes: '',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);

    if (!form.date) { toast.error('الرجاء اختيار التاريخ'); return; }
    if (isNaN(amount) || amount <= 0) { toast.error('الرجاء إدخال مبلغ صحيح'); return; }

    setSubmitting(true);
    onAdd({
      date: form.date,
      amount,
      category: form.category,
      notes: form.notes.trim(),
    });
    toast.success(`✅ تم تسجيل مصروف ${form.category} بنجاح`);
    setForm({ date: todayISO(), amount: '', category: 'علف', notes: '' });
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
    toast.success('تم حذف سجل المصروف');
  };

  // Category summary
  const categorySummary = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses
      .filter(e => e.category === cat.value)
      .reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === cat.value).length,
  }));
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Add Expense Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="farm-card p-4 sm:p-6"
      >
        <h2 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
          <span>📊</span> إضافة مصروف
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
            <label className="block text-sm text-muted-foreground mb-1">المبلغ (ر.س) *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="farm-input"
              placeholder="مثال: 200"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">الفئة *</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    form.category === cat.value
                      ? 'border-green-500/50 bg-green-500/15 text-foreground'
                      : 'border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">ملاحظات</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="farm-input"
              placeholder="تفاصيل إضافية (اختياري)"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-200"
            >
              {submitting ? 'جاري الحفظ...' : '+ إضافة المصروف'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Category Summary */}
      {grandTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="farm-card p-4 sm:p-6"
        >
          <h3 className="font-cairo font-bold mb-4 flex items-center gap-2">
            <span>📈</span> ملخص المصاريف حسب الفئة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {categorySummary.map(cat => (
              <div
                key={cat.value}
                className="p-3 rounded-lg text-center"
                style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
                <p className="font-bold text-sm" style={{ color: cat.color }}>
                  {formatCurrency(cat.total)}
                </p>
                <p className="text-xs text-muted-foreground">{cat.count} سجل</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="font-bold">الإجمالي</span>
            <span className="font-bold text-expense">{formatCurrency(grandTotal)}</span>
          </div>
        </motion.div>
      )}

      {/* Expenses History */}
      <div className="farm-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-cairo font-bold flex items-center gap-2">
            <span>📋</span> سجل المصاريف
            {expenses.length > 0 && (
              <span className="farm-badge bg-white/10 text-muted-foreground">{expenses.length}</span>
            )}
          </h2>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-4xl block mb-2">📊</span>
            <p>لا توجد مصاريف مسجلة بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right p-3 text-muted-foreground font-medium">التاريخ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الفئة</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">المبلغ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">ملاحظات</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {expenses.map((exp, i) => {
                    const cat = CATEGORIES.find(c => c.value === exp.category);
                    return (
                      <motion.tr
                        key={exp.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, delay: i * 0.02 }}
                        className="farm-table-row"
                      >
                        <td className="p-3 whitespace-nowrap">{formatDate(exp.date)}</td>
                        <td className="p-3">
                          <span
                            className="farm-badge"
                            style={{
                              background: `${cat?.color || '#888'}20`,
                              color: cat?.color || '#888',
                            }}
                          >
                            {cat?.icon} {exp.category}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-expense">{formatCurrency(exp.amount)}</td>
                        <td className="p-3 text-muted-foreground max-w-[150px] truncate">
                          {exp.notes || '—'}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setDeleteId(exp.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/10"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف سجل المصروف"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
