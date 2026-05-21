// مشروع تربية الأغنام — Losses Tab

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Loss, LossReason } from '../lib/types';
import { formatDate, formatNumber, todayISO } from '../lib/format';
import ConfirmDialog from './ConfirmDialog';

interface LossesTabProps {
  losses: Loss[];
  currentOwned: number;
  onAdd: (input: Omit<Loss, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const REASONS: { value: LossReason; label: string; icon: string; color: string }[] = [
  { value: 'نفوق', label: 'نفوق', icon: '💀', color: '#ef4444' },
  { value: 'سرقة', label: 'سرقة', icon: '🚨', color: '#f59e0b' },
  { value: 'أخرى', label: 'أخرى', icon: '❓', color: '#8b5cf6' },
];

export default function LossesTab({ losses, currentOwned, onAdd, onDelete }: LossesTabProps) {
  const [form, setForm] = useState({
    date: todayISO(),
    count: '',
    reason: 'نفوق' as LossReason,
    notes: '',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(form.count);

    if (!form.date) { toast.error('الرجاء اختيار التاريخ'); return; }
    if (isNaN(count) || count <= 0) { toast.error('الرجاء إدخال عدد صحيح'); return; }
    if (count > currentOwned) { toast.error(`لا يمكن تسجيل خسارة أكثر من ${currentOwned} رأس متاح`); return; }

    setSubmitting(true);
    onAdd({
      date: form.date,
      count,
      reason: form.reason,
      notes: form.notes.trim(),
    });
    toast.success(`✅ تم تسجيل خسارة ${count} رأس (${form.reason})`);
    setForm({ date: todayISO(), count: '', reason: 'نفوق', notes: '' });
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
    toast.success('تم حذف سجل الخسارة');
  };

  const totalLost = losses.reduce((s, l) => s + l.count, 0);
  const reasonSummary = REASONS.map(r => ({
    ...r,
    total: losses.filter(l => l.reason === r.value).reduce((s, l) => s + l.count, 0),
    count: losses.filter(l => l.reason === r.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Add Loss Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="farm-card p-4 sm:p-6"
      >
        <h2 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
          <span>💔</span> تسجيل خسارة
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
              placeholder="مثال: 2"
              min="1"
              max={currentOwned}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">السبب *</label>
            <div className="grid grid-cols-3 gap-2">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, reason: r.value }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                    form.reason === r.value
                      ? 'border-red-500/50 bg-red-500/15 text-foreground'
                      : 'border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span>{r.label}</span>
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
              disabled={submitting || currentOwned === 0}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-200"
            >
              {submitting ? 'جاري الحفظ...' : '+ تسجيل الخسارة'}
            </button>
            {currentOwned === 0 && (
              <p className="text-xs text-expense mt-2">لا يوجد رؤوس متاحة</p>
            )}
          </div>
        </form>
      </motion.div>

      {/* Summary */}
      {losses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="farm-card p-4 sm:p-6"
        >
          <h3 className="font-cairo font-bold mb-4 flex items-center gap-2">
            <span>📊</span> ملخص الخسائر
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {reasonSummary.map(r => (
              <div
                key={r.value}
                className="p-3 rounded-lg text-center"
                style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}
              >
                <span className="text-2xl block mb-1">{r.icon}</span>
                <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                <p className="font-bold text-lg" style={{ color: r.color }}>
                  {formatNumber(r.total)}
                </p>
                <p className="text-xs text-muted-foreground">رأس</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="font-bold">إجمالي الخسائر</span>
            <span className="font-bold text-expense">{formatNumber(totalLost)} رأس</span>
          </div>
        </motion.div>
      )}

      {/* Losses History */}
      <div className="farm-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-cairo font-bold flex items-center gap-2">
            <span>📋</span> سجل الخسائر
            {losses.length > 0 && (
              <span className="farm-badge bg-white/10 text-muted-foreground">{losses.length}</span>
            )}
          </h2>
        </div>

        {losses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-4xl block mb-2">💔</span>
            <p>لا توجد خسائر مسجلة — هذا جيد! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right p-3 text-muted-foreground font-medium">التاريخ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">العدد</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">السبب</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">ملاحظات</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {losses.map((l, i) => {
                    const reason = REASONS.find(r => r.value === l.reason);
                    return (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, delay: i * 0.02 }}
                        className="farm-table-row"
                      >
                        <td className="p-3 whitespace-nowrap">{formatDate(l.date)}</td>
                        <td className="p-3 font-bold text-expense">{formatNumber(l.count)} رأس</td>
                        <td className="p-3">
                          <span
                            className="farm-badge"
                            style={{
                              background: `${reason?.color || '#888'}20`,
                              color: reason?.color || '#888',
                            }}
                          >
                            {reason?.icon} {l.reason}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[150px] truncate">
                          {l.notes || '—'}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setDeleteId(l.id)}
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
        title="حذف سجل الخسارة"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
