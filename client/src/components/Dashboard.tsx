// مشروع تربية الأغنام — Dashboard Component
// Design: Dark green glassmorphism cards, functional color coding

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import type { DashboardStats, FarmData } from '../lib/types';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  profitColor,
  signPrefix,
  clamp,
} from '../lib/format';
import { generatePDFReport } from '../lib/pdf-report';

interface DashboardProps {
  stats: DashboardStats;
  feedBudget: number;
  onSetFeedBudget: (budget: number) => void;
  farmData: FarmData;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon: string;
  index: number;
}

function StatCard({ title, value, subtitle, color = 'text-foreground', icon, index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="farm-card farm-card-hover p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold font-cairo stat-number ${color}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard({ stats, feedBudget, onSetFeedBudget, farmData }: DashboardProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(feedBudget.toString());
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleExportPDF = async () => {
    try {
      setGeneratingPDF(true);
      await generatePDFReport({ stats, farmData });
      toast.success('✅ تم تنزيل التقرير بنجاح');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('❌ فشل تنزيل التقرير');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const feedPct = clamp(stats.feedBudgetUsedPercent, 0, 100);
  const feedAlertLevel = feedPct >= 100 ? 'critical' : feedPct >= 80 ? 'warning' : 'ok';

  const handleBudgetSave = () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    onSetFeedBudget(val);
    setEditingBudget(false);
    toast.success('تم تحديث ميزانية العلف');
  };

  const expenseCategories = [
    { key: 'علف' as const, label: 'علف', icon: '🌾', color: '#22c55e' },
    { key: 'حبوب' as const, label: 'حبوب', icon: '🌽', color: '#f59e0b' },
    { key: 'دواء' as const, label: 'دواء', icon: '💊', color: '#3b82f6' },
    { key: 'أخرى' as const, label: 'أخرى', icon: '📦', color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* PDF Export Button */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <button
          onClick={handleExportPDF}
          disabled={generatingPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-colors duration-200"
        >
          <span>{generatingPDF ? '⏳' : '📄'}</span>
          {generatingPDF ? 'جاري الإنشاء...' : 'تنزيل التقرير PDF'}
        </button>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          index={0}
          title="إجمالي الأغنام المشتراة"
          value={formatNumber(stats.totalPurchased)}
          subtitle="رأس"
          icon="🛒"
        />
        <StatCard
          index={1}
          title="الأغنام الحالية"
          value={formatNumber(stats.currentOwned)}
          subtitle="رأس متاح"
          icon="🐑"
          color="text-income"
        />
        <StatCard
          index={2}
          title="إجمالي المبيعات"
          value={formatCurrency(stats.totalSaleRevenue)}
          subtitle={`${formatNumber(stats.totalSold)} رأس مباع`}
          icon="💰"
          color="text-income"
        />
        <StatCard
          index={3}
          title="إجمالي المشتريات"
          value={formatCurrency(stats.totalPurchaseCost)}
          subtitle={`متوسط ${formatCurrency(stats.averagePurchasePrice)} / رأس`}
          icon="🏪"
          color="text-expense"
        />
      </div>

      {/* Financial Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          index={4}
          title="إجمالي المصاريف"
          value={formatCurrency(stats.totalExpenses)}
          subtitle="علف + دواء + أخرى"
          icon="📊"
          color="text-expense"
        />
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="farm-card farm-card-hover p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">صافي الربح / الخسارة</p>
              <p className={`text-xl sm:text-2xl font-bold font-cairo stat-number ${profitColor(stats.netProfit)}`}>
                {signPrefix(stats.netProfit)}{formatCurrency(stats.netProfit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                هامش {signPrefix(stats.profitMargin)}{formatPercent(stats.profitMargin)}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl flex-shrink-0">
              {stats.netProfit >= 0 ? '📈' : '📉'}
            </span>
          </div>
        </motion.div>
        <StatCard
          index={6}
          title="متوسط سعر البيع"
          value={formatCurrency(stats.averageSalePrice)}
          subtitle="للرأس الواحد"
          icon="🏷️"
        />
      </div>

      {/* Feed Budget Alert */}
      <motion.div
        custom={7}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`farm-card p-4 sm:p-5 ${
          feedAlertLevel === 'critical'
            ? 'border-red-500/40 bg-red-500/10'
            : feedAlertLevel === 'warning'
            ? 'border-yellow-500/40 bg-yellow-500/10'
            : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌾</span>
              <h3 className="font-cairo font-bold text-sm sm:text-base">ميزانية العلف والحبوب</h3>
              {feedAlertLevel === 'warning' && (
                <span className="farm-badge bg-yellow-500/20 text-yellow-400 text-xs">
                  ⚠️ تجاوز 80٪
                </span>
              )}
              {feedAlertLevel === 'critical' && (
                <span className="farm-badge bg-red-500/20 text-red-400 text-xs">
                  🚨 تجاوز الميزانية
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-income font-bold">{formatCurrency(stats.feedExpenses)}</span>
              <span className="text-muted-foreground text-sm">من</span>
              {editingBudget ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="farm-input w-32 text-sm"
                    placeholder="الميزانية"
                    onKeyDown={e => e.key === 'Enter' && handleBudgetSave()}
                    autoFocus
                  />
                  <button
                    onClick={handleBudgetSave}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => { setEditingBudget(false); setBudgetInput(feedBudget.toString()); }}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingBudget(true); setBudgetInput(feedBudget.toString()); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dashed"
                >
                  {feedBudget > 0 ? formatCurrency(feedBudget) : 'تعيين الميزانية'}
                </button>
              )}
            </div>

            {feedBudget > 0 && (
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{
                    background: feedAlertLevel === 'critical'
                      ? '#ef4444'
                      : feedAlertLevel === 'warning'
                      ? '#f59e0b'
                      : '#22c55e',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${feedPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            )}
            {feedBudget > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatPercent(feedPct)} مستخدم
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Expenses by Category */}
      {stats.totalExpenses > 0 && (
        <motion.div
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="farm-card p-4 sm:p-5"
        >
          <h3 className="font-cairo font-bold mb-4 flex items-center gap-2">
            <span>📊</span> المصاريف حسب الفئة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {expenseCategories.map(cat => {
              const amount = stats.expensesByCategory[cat.key] || 0;
              const pct = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
              return (
                <div key={cat.key} className="text-center p-3 rounded-lg bg-white/5">
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
                  <p className="font-bold text-sm" style={{ color: cat.color }}>
                    {formatCurrency(amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatPercent(pct)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cost per Head */}
      {stats.totalPurchased > 0 && (
        <motion.div
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="farm-card p-4 sm:p-5"
        >
          <h3 className="font-cairo font-bold mb-4 flex items-center gap-2">
            <span>🧮</span> ملخص التكلفة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">تكلفة الرأس الواحد</p>
              <p className="text-lg font-bold text-warning">{formatCurrency(stats.costPerHead)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الخسائر (عدد الرؤوس)</p>
              <p className="text-lg font-bold text-expense">{formatNumber(stats.totalLost)} رأس</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">هامش الربح</p>
              <p className={`text-lg font-bold ${profitColor(stats.profitMargin)}`}>
                {signPrefix(stats.profitMargin)}{formatPercent(stats.profitMargin)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
