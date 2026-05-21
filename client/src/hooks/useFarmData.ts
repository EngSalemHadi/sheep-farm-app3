// مشروع تربية الأغنام — Farm Data Hook
// Manages all farm data with localStorage persistence

import { useState, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type {
  FarmData,
  Purchase,
  Sale,
  Expense,
  Loss,
  DashboardStats,
  Transaction,
  ExpenseCategory,
} from '../lib/types';

const STORAGE_KEY = 'sheep-farm-data';

const DEFAULT_DATA: FarmData = {
  purchases: [],
  sales: [],
  expenses: [],
  losses: [],
  feedBudget: 0,
  lastUpdated: new Date().toISOString(),
};

function loadData(): FarmData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as FarmData;
    return {
      ...DEFAULT_DATA,
      ...parsed,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function saveData(data: FarmData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    }));
  } catch {
    // ignore storage errors
  }
}

export function useFarmData() {
  const [data, setData] = useState<FarmData>(loadData);

  const update = useCallback((updater: (prev: FarmData) => FarmData) => {
    setData(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ── Purchases ──────────────────────────────────────────────────────────────
  const addPurchase = useCallback((input: Omit<Purchase, 'id' | 'totalCost' | 'createdAt'>) => {
    const purchase: Purchase = {
      ...input,
      id: nanoid(),
      totalCost: input.count * input.pricePerHead,
      createdAt: new Date().toISOString(),
    };
    update(prev => ({
      ...prev,
      purchases: [purchase, ...prev.purchases],
    }));
    return purchase;
  }, [update]);

  const deletePurchase = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      purchases: prev.purchases.filter(p => p.id !== id),
    }));
  }, [update]);

  // ── Sales ──────────────────────────────────────────────────────────────────
  const addSale = useCallback((input: Omit<Sale, 'id' | 'totalRevenue' | 'createdAt'>) => {
    const sale: Sale = {
      ...input,
      id: nanoid(),
      totalRevenue: input.count * input.pricePerHead,
      createdAt: new Date().toISOString(),
    };
    update(prev => ({
      ...prev,
      sales: [sale, ...prev.sales],
    }));
    return sale;
  }, [update]);

  const deleteSale = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.id !== id),
    }));
  }, [update]);

  // ── Expenses ───────────────────────────────────────────────────────────────
  const addExpense = useCallback((input: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    update(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
    return expense;
  }, [update]);

  const deleteExpense = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id),
    }));
  }, [update]);

  // ── Losses ─────────────────────────────────────────────────────────────────
  const addLoss = useCallback((input: Omit<Loss, 'id' | 'createdAt'>) => {
    const loss: Loss = {
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    update(prev => ({
      ...prev,
      losses: [loss, ...prev.losses],
    }));
    return loss;
  }, [update]);

  const deleteLoss = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      losses: prev.losses.filter(l => l.id !== id),
    }));
  }, [update]);

  // ── Feed Budget ────────────────────────────────────────────────────────────
  const setFeedBudget = useCallback((budget: number) => {
    update(prev => ({ ...prev, feedBudget: budget }));
  }, [update]);

  // ── Dashboard Stats ────────────────────────────────────────────────────────
  const stats = useMemo((): DashboardStats => {
    const { purchases, sales, expenses, losses, feedBudget } = data;

    const totalPurchased = purchases.reduce((s, p) => s + p.count, 0);
    const totalSold = sales.reduce((s, sale) => s + sale.count, 0);
    const totalLost = losses.reduce((s, l) => s + l.count, 0);
    const currentOwned = Math.max(0, totalPurchased - totalSold - totalLost);

    const totalPurchaseCost = purchases.reduce((s, p) => s + p.totalCost, 0);
    const totalSaleRevenue = sales.reduce((s, sale) => s + sale.totalRevenue, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalSaleRevenue - totalPurchaseCost - totalExpenses;

    const avgPurchasePrice = totalPurchased > 0
      ? totalPurchaseCost / totalPurchased
      : 0;
    const avgSalePrice = totalSold > 0
      ? totalSaleRevenue / totalSold
      : 0;

    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const feedExpenses = (expensesByCategory['علف'] || 0) + (expensesByCategory['حبوب'] || 0);
    const feedBudgetUsedPercent = feedBudget > 0
      ? Math.min(100, (feedExpenses / feedBudget) * 100)
      : 0;

    const profitMargin = totalSaleRevenue > 0
      ? (netProfit / totalSaleRevenue) * 100
      : 0;

    const costPerHead = totalPurchased > 0
      ? (totalPurchaseCost + totalExpenses) / totalPurchased
      : 0;

    return {
      totalPurchased,
      totalSold,
      totalLost,
      currentOwned,
      totalPurchaseCost,
      totalSaleRevenue,
      totalExpenses,
      netProfit,
      averagePurchasePrice: avgPurchasePrice,
      averageSalePrice: avgSalePrice,
      feedExpenses,
      feedBudgetUsedPercent,
      expensesByCategory,
      profitMargin,
      costPerHead,
    };
  }, [data]);

  // ── All Transactions (sorted newest first) ─────────────────────────────────
  const transactions = useMemo((): Transaction[] => {
    const all: Transaction[] = [
      ...data.purchases.map(p => ({
        id: p.id,
        type: 'purchase' as const,
        date: p.date,
        description: `شراء ${p.count} رأس من ${p.source}`,
        amount: -p.totalCost,
        details: p,
      })),
      ...data.sales.map(s => ({
        id: s.id,
        type: 'sale' as const,
        date: s.date,
        description: `بيع ${s.count} رأس لـ ${s.buyerName}`,
        amount: s.totalRevenue,
        details: s,
      })),
      ...data.expenses.map(e => ({
        id: e.id,
        type: 'expense' as const,
        date: e.date,
        description: `مصروف ${e.category}${e.notes ? ': ' + e.notes : ''}`,
        amount: -e.amount,
        details: e,
      })),
      ...data.losses.map(l => ({
        id: l.id,
        type: 'loss' as const,
        date: l.date,
        description: `خسارة ${l.count} رأس (${l.reason})${l.notes ? ': ' + l.notes : ''}`,
        amount: 0,
        details: l,
      })),
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  // ── Backup & Restore ───────────────────────────────────────────────────────
  const exportBackup = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheep-farm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importBackup = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as FarmData;
          const restored: FarmData = {
            ...DEFAULT_DATA,
            ...parsed,
          };
          saveData(restored);
          setData(restored);
          resolve();
        } catch {
          reject(new Error('ملف النسخة الاحتياطية غير صالح'));
        }
      };
      reader.onerror = () => reject(new Error('فشل قراءة الملف'));
      reader.readAsText(file);
    });
  }, []);

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const rows: string[] = [
      'النوع,التاريخ,الوصف,المبلغ',
      ...transactions.map(t => {
        const amount = t.type === 'loss' ? 'خسارة' : t.amount.toFixed(2);
        return `"${t.type === 'purchase' ? 'شراء' : t.type === 'sale' ? 'بيع' : t.type === 'expense' ? 'مصروف' : 'خسارة'}","${t.date}","${t.description}","${amount}"`;
      }),
    ];
    const bom = '\uFEFF'; // UTF-8 BOM for Arabic Excel support
    const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheep-farm-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  // ── Share Link ─────────────────────────────────────────────────────────────
  const getShareLink = useCallback(() => {
    try {
      const compressed = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}?data=${compressed}`;
      return url;
    } catch {
      return window.location.href;
    }
  }, [data]);

  // ── Load from share link on mount ─────────────────────────────────────────
  const loadFromShareLink = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('data');
      if (!encoded) return false;
      const parsed = JSON.parse(decodeURIComponent(atob(encoded))) as FarmData;
      const restored: FarmData = { ...DEFAULT_DATA, ...parsed };
      saveData(restored);
      setData(restored);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    data,
    stats,
    transactions,
    addPurchase,
    deletePurchase,
    addSale,
    deleteSale,
    addExpense,
    deleteExpense,
    addLoss,
    deleteLoss,
    setFeedBudget,
    exportBackup,
    importBackup,
    exportCSV,
    getShareLink,
    loadFromShareLink,
  };
}
