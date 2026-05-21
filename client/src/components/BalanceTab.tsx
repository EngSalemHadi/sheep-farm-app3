// مشروع تربية الأغنام — Balance Tab (الميزانية)

import { motion, type Variants } from 'framer-motion';
import type { DashboardStats } from '../lib/types';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  profitColor,
  signPrefix,
} from '../lib/format';

interface BalanceTabProps {
  stats: DashboardStats;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: 'easeOut' as const },
  }),
};

interface BalanceRowProps {
  label: string;
  value: string;
  valueClass?: string;
  icon?: string;
  bold?: boolean;
  separator?: boolean;
}

function BalanceRow({ label, value, valueClass = '', icon, bold, separator }: BalanceRowProps) {
  return (
    <>
      {separator && <div className="border-t border-white/10 my-2" />}
      <div className={`flex justify-between items-center py-2.5 px-1 ${bold ? 'font-bold' : ''}`}>
        <span className={`text-sm ${bold ? 'text-foreground' : 'text-muted-foreground'} flex items-center gap-2`}>
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
      </div>
    </>
  );
}

export default function BalanceTab({ stats }: BalanceTabProps) {
  const isProfit = stats.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Net Profit Hero Card */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`farm-card p-6 text-center ${
          isProfit
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-red-500/30 bg-red-500/5'
        }`}
      >
        <span className="text-4xl block mb-2">{isProfit ? '📈' : '📉'}</span>
        <p className="text-sm text-muted-foreground mb-1">صافي الربح / الخسارة</p>
        <p className={`text-4xl font-bold font-cairo ${profitColor(stats.netProfit)}`}>
          {signPrefix(stats.netProfit)}{formatCurrency(stats.netProfit)}
        </p>
        <p className={`text-sm mt-2 ${profitColor(stats.profitMargin)}`}>
          هامش الربح: {signPrefix(stats.profitMargin)}{formatPercent(stats.profitMargin)}
        </p>
      </motion.div>

      {/* Income Statement */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="farm-card p-4 sm:p-6"
      >
        <h3 className="font-cairo font-bold text-base mb-4 flex items-center gap-2">
          <span>📑</span> قائمة الدخل
        </h3>

        <div className="space-y-0">
          <BalanceRow
            label="إجمالي إيرادات البيع"
            value={formatCurrency(stats.totalSaleRevenue)}
            valueClass="text-income"
            icon="💰"
          />
          <BalanceRow
            label={`عدد الرؤوس المباعة (${formatNumber(stats.totalSold)} رأس)`}
            value={`متوسط ${formatCurrency(stats.averageSalePrice)} / رأس`}
            icon="🐑"
          />

          <BalanceRow
            label="تكلفة المشتريات"
            value={`- ${formatCurrency(stats.totalPurchaseCost)}`}
            valueClass="text-expense"
            icon="🛒"
            separator
          />
          <BalanceRow
            label={`عدد الرؤوس المشتراة (${formatNumber(stats.totalPurchased)} رأس)`}
            value={`متوسط ${formatCurrency(stats.averagePurchasePrice)} / رأس`}
            icon="🏪"
          />

          <BalanceRow
            label="إجمالي المصاريف التشغيلية"
            value={`- ${formatCurrency(stats.totalExpenses)}`}
            valueClass="text-expense"
            icon="📊"
            separator
          />

          <BalanceRow
            label="صافي الربح / الخسارة"
            value={`${signPrefix(stats.netProfit)}${formatCurrency(stats.netProfit)}`}
            valueClass={profitColor(stats.netProfit)}
            icon={isProfit ? '✅' : '❌'}
            bold
            separator
          />
        </div>
      </motion.div>

      {/* Flock Status */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="farm-card p-4 sm:p-6"
      >
        <h3 className="font-cairo font-bold text-base mb-4 flex items-center gap-2">
          <span>🐑</span> حالة القطيع
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-income">{formatNumber(stats.totalPurchased)}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي المشتريات</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-expense">{formatNumber(stats.totalSold)}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي المبيعات</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-warning">{formatNumber(stats.totalLost)}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الخسائر</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-2xl font-bold text-income">{formatNumber(stats.currentOwned)}</p>
            <p className="text-xs text-muted-foreground mt-1">المتاح حالياً</p>
          </div>
        </div>
      </motion.div>

      {/* Cost Analysis */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="farm-card p-4 sm:p-6"
      >
        <h3 className="font-cairo font-bold text-base mb-4 flex items-center gap-2">
          <span>🧮</span> تحليل التكاليف
        </h3>
        <div className="space-y-0">
          <BalanceRow
            label="تكلفة الرأس الواحد (شراء + مصاريف)"
            value={formatCurrency(stats.costPerHead)}
            valueClass="text-warning"
            icon="💲"
          />
          <BalanceRow
            label="متوسط سعر الشراء"
            value={formatCurrency(stats.averagePurchasePrice)}
            icon="⬇️"
          />
          <BalanceRow
            label="متوسط سعر البيع"
            value={formatCurrency(stats.averageSalePrice)}
            icon="⬆️"
          />
          {stats.averageSalePrice > 0 && stats.costPerHead > 0 && (
            <BalanceRow
              label="الربح للرأس الواحد (تقديري)"
              value={`${signPrefix(stats.averageSalePrice - stats.costPerHead)}${formatCurrency(stats.averageSalePrice - stats.costPerHead)}`}
              valueClass={profitColor(stats.averageSalePrice - stats.costPerHead)}
              icon="📐"
              bold
              separator
            />
          )}
        </div>
      </motion.div>

      {/* Expenses Breakdown */}
      {stats.totalExpenses > 0 && (
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="farm-card p-4 sm:p-6"
        >
          <h3 className="font-cairo font-bold text-base mb-4 flex items-center gap-2">
            <span>📊</span> تفصيل المصاريف
          </h3>
          {[
            { key: 'علف' as const, label: 'علف', icon: '🌾', color: '#22c55e' },
            { key: 'حبوب' as const, label: 'حبوب', icon: '🌽', color: '#f59e0b' },
            { key: 'دواء' as const, label: 'دواء', icon: '💊', color: '#3b82f6' },
            { key: 'أخرى' as const, label: 'أخرى', icon: '📦', color: '#8b5cf6' },
          ].map(cat => {
            const amount = stats.expensesByCategory[cat.key] || 0;
            if (amount === 0) return null;
            const pct = (amount / stats.totalExpenses) * 100;
            return (
              <div key={cat.key} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-muted-foreground">{cat.label}</span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>
                    {formatCurrency(amount)} ({formatPercent(pct)})
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
            <span className="text-sm font-bold">الإجمالي</span>
            <span className="text-sm font-bold text-expense">{formatCurrency(stats.totalExpenses)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
