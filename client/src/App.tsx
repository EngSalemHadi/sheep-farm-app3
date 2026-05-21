// مشروع تربية الأغنام — Main App
// Design: Professional Dark Dashboard, RTL Arabic, Cairo + Tajawal fonts
// All tabs, header, backup/restore, CSV export, share link

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useFarmData } from './hooks/useFarmData';
import Dashboard from './components/Dashboard';
import PurchaseTab from './components/PurchaseTab';
import SalesTab from './components/SalesTab';
import ExpensesTab from './components/ExpensesTab';
import LossesTab from './components/LossesTab';
import BalanceTab from './components/BalanceTab';
import RecordsTab from './components/RecordsTab';
import ErrorBoundary from './components/ErrorBoundary';

type TabId = 'dashboard' | 'purchases' | 'sales' | 'expenses' | 'losses' | 'balance' | 'records';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { id: 'purchases', label: 'الشراء', icon: '🛒' },
  { id: 'sales', label: 'البيع', icon: '💰' },
  { id: 'expenses', label: 'المصاريف', icon: '📈' },
  { id: 'losses', label: 'الخسائر', icon: '💔' },
  { id: 'balance', label: 'الميزانية', icon: '⚖️' },
  { id: 'records', label: 'السجل', icon: '📋' },
];

const pageVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const farm = useFarmData();

  // Load from share link on mount
  useEffect(() => {
    const loaded = farm.loadFromShareLink();
    if (loaded) {
      toast.success('✅ تم استيراد البيانات من الرابط المشارك');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await farm.importBackup(file);
      toast.success('✅ تم استعادة النسخة الاحتياطية بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل استيراد الملف');
    }
    e.target.value = '';
    setShowMenu(false);
  };

  const handleShareLink = async () => {
    const url = farm.getShareLink();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('✅ تم نسخ رابط المشاركة');
    } catch {
      toast.info('رابط المشاركة: ' + url.substring(0, 60) + '...');
    }
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    farm.exportCSV();
    toast.success('✅ تم تصدير البيانات إلى CSV');
    setShowMenu(false);
  };

  const handleExportBackup = () => {
    farm.exportBackup();
    toast.success('✅ تم تنزيل النسخة الاحتياطية');
    setShowMenu(false);
  };

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster
          position="top-center"
          dir="rtl"
          richColors
          toastOptions={{
            style: {
              fontFamily: "'Tajawal', sans-serif",
              direction: 'rtl',
            },
          }}
        />

        <div className="min-h-screen" style={{ background: '#0f1a10' }}>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-40 border-b border-white/8"
            style={{ background: 'rgba(15,26,16,0.95)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🐑</span>
                <div>
                  <h1 className="font-cairo font-bold text-base sm:text-lg leading-tight">
                    مشروع تربية الأغنام
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    نظام إدارة المزرعة
                  </p>
                </div>
              </div>

              {/* Stats Quick View */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">القطيع</p>
                  <p className="font-bold text-income">{farm.stats.currentOwned} رأس</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">صافي الربح</p>
                  <p className={`font-bold ${farm.stats.netProfit >= 0 ? 'text-income' : 'text-expense'}`}>
                    {farm.stats.netProfit >= 0 ? '+' : ''}{farm.stats.netProfit.toFixed(0)} ر.س
                  </p>
                </div>
              </div>

              {/* Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="p-2 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
                  title="خيارات"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="19" r="1" fill="currentColor" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-0 top-full mt-2 w-52 farm-card shadow-2xl overflow-hidden z-50"
                      style={{ transformOrigin: 'top left' }}
                    >
                      <div className="p-1">
                        <button
                          onClick={handleExportCSV}
                          className="w-full text-right px-3 py-2.5 text-sm rounded-md hover:bg-white/8 transition-colors flex items-center gap-2"
                        >
                          <span>📄</span> تصدير CSV
                        </button>
                        <button
                          onClick={handleExportBackup}
                          className="w-full text-right px-3 py-2.5 text-sm rounded-md hover:bg-white/8 transition-colors flex items-center gap-2"
                        >
                          <span>💾</span> نسخة احتياطية
                        </button>
                        <button
                          onClick={() => { fileInputRef.current?.click(); }}
                          className="w-full text-right px-3 py-2.5 text-sm rounded-md hover:bg-white/8 transition-colors flex items-center gap-2"
                        >
                          <span>📂</span> استعادة نسخة
                        </button>
                        <div className="border-t border-white/8 my-1" />
                        <button
                          onClick={handleShareLink}
                          className="w-full text-right px-3 py-2.5 text-sm rounded-md hover:bg-white/8 transition-colors flex items-center gap-2"
                        >
                          <span>🔗</span> مشاركة الرابط
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-6xl mx-auto px-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-0.5 pb-0 min-w-max">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-400 bg-green-500/8'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/4'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ── Main Content ────────────────────────────────────────────────── */}
          <main className="max-w-6xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    stats={farm.stats}
                    feedBudget={farm.data.feedBudget}
                    onSetFeedBudget={farm.setFeedBudget}
                    farmData={farm.data}
                  />
                )}
                {activeTab === 'purchases' && (
                  <PurchaseTab
                    purchases={farm.data.purchases}
                    onAdd={farm.addPurchase}
                    onDelete={farm.deletePurchase}
                  />
                )}
                {activeTab === 'sales' && (
                  <SalesTab
                    sales={farm.data.sales}
                    currentOwned={farm.stats.currentOwned}
                    onAdd={farm.addSale}
                    onDelete={farm.deleteSale}
                  />
                )}
                {activeTab === 'expenses' && (
                  <ExpensesTab
                    expenses={farm.data.expenses}
                    onAdd={farm.addExpense}
                    onDelete={farm.deleteExpense}
                  />
                )}
                {activeTab === 'losses' && (
                  <LossesTab
                    losses={farm.data.losses}
                    currentOwned={farm.stats.currentOwned}
                    onAdd={farm.addLoss}
                    onDelete={farm.deleteLoss}
                  />
                )}
                {activeTab === 'balance' && (
                  <BalanceTab stats={farm.stats} />
                )}
                {activeTab === 'records' && (
                  <RecordsTab transactions={farm.transactions} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <footer className="border-t border-white/5 mt-8 py-4 text-center text-xs text-muted-foreground">
            <p>مشروع تربية الأغنام 🐑 — جميع البيانات محفوظة محلياً على جهازك</p>
          </footer>
        </div>

        {/* Hidden file input for backup restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportBackup}
        />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
