// مشروع تربية الأغنام — Records Tab (السجل الكامل)

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Transaction, TransactionType } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/format';

interface RecordsTabProps {
  transactions: Transaction[];
}

const TYPE_CONFIG: Record<TransactionType, { label: string; icon: string; color: string; bg: string }> = {
  purchase: { label: 'شراء', icon: '🛒', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  sale: { label: 'بيع', icon: '💰', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  expense: { label: 'مصروف', icon: '📊', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  loss: { label: 'خسارة', icon: '💔', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const listVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: 'easeOut' as const },
  }),
};

export default function RecordsTab({ transactions }: RecordsTabProps) {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search && !t.description.includes(search)) return false;
    return true;
  });

  const totalIncome = filtered
    .filter(t => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalOutflow = filtered
    .filter(t => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="farm-card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="farm-input flex-1"
            placeholder="🔍 بحث في السجلات..."
          />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'purchase', 'sale', 'expense', 'loss'] as const).map(type => {
              const config = type === 'all' ? null : TYPE_CONFIG[type];
              const count = type === 'all'
                ? transactions.length
                : transactions.filter(t => t.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
                    filter === type
                      ? 'bg-green-500/20 border-green-500/40 text-green-400'
                      : 'border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {config ? `${config.icon} ${config.label}` : 'الكل'} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
            <div className="text-sm">
              <span className="text-muted-foreground">الإيرادات: </span>
              <span className="text-income font-bold">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">المصروفات: </span>
              <span className="text-expense font-bold">{formatCurrency(totalOutflow)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">السجلات: </span>
              <span className="font-bold">{filtered.length}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction List */}
      <div className="farm-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-cairo font-bold flex items-center gap-2">
            <span>📋</span> السجل الكامل
            <span className="farm-badge bg-white/10 text-muted-foreground">{filtered.length}</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-4xl block mb-2">📭</span>
            <p>{transactions.length === 0 ? 'لا توجد سجلات بعد' : 'لا توجد نتائج للبحث'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {filtered.map((t, i) => {
                const config = TYPE_CONFIG[t.type];
                return (
                  <motion.div
                    key={t.id}
                    custom={i}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Badge */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: config.bg }}
                      >
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(t.date)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {t.type === 'loss' ? (
                              <span className="text-sm font-bold" style={{ color: config.color }}>
                                خسارة
                              </span>
                            ) : (
                              <span
                                className="text-sm font-bold"
                                style={{ color: t.amount > 0 ? '#22c55e' : '#ef4444' }}
                              >
                                {t.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                              </span>
                            )}
                            <span
                              className="farm-badge block mt-1 text-xs"
                              style={{ background: config.bg, color: config.color }}
                            >
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
