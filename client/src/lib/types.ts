// مشروع تربية الأغنام — Core Types
// All data types for the sheep farm management system

export type ExpenseCategory = 'علف' | 'حبوب' | 'دواء' | 'أخرى';
export type LossReason = 'نفوق' | 'سرقة' | 'أخرى';

export interface Purchase {
  id: string;
  date: string;         // ISO date string
  count: number;        // number of sheep purchased
  pricePerHead: number; // price per sheep
  source: string;       // seller / source name
  totalCost: number;    // count * pricePerHead
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  count: number;
  pricePerHead: number;
  buyerName: string;
  totalRevenue: number; // count * pricePerHead
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  notes: string;
  createdAt: string;
}

export interface Loss {
  id: string;
  date: string;
  count: number;
  reason: LossReason;
  notes: string;
  createdAt: string;
}

export interface FarmData {
  purchases: Purchase[];
  sales: Sale[];
  expenses: Expense[];
  losses: Loss[];
  feedBudget: number;   // total feed budget set by user
  lastUpdated: string;
}

export interface DashboardStats {
  totalPurchased: number;       // total sheep ever purchased
  totalSold: number;            // total sheep ever sold
  totalLost: number;            // total sheep lost
  currentOwned: number;         // totalPurchased - totalSold - totalLost
  totalPurchaseCost: number;    // sum of all purchase costs
  totalSaleRevenue: number;     // sum of all sale revenues
  totalExpenses: number;        // sum of all expenses
  netProfit: number;            // totalSaleRevenue - totalPurchaseCost - totalExpenses
  averagePurchasePrice: number; // avg price per head purchased
  averageSalePrice: number;     // avg price per head sold
  feedExpenses: number;         // expenses in علف + حبوب categories
  feedBudgetUsedPercent: number; // feedExpenses / feedBudget * 100
  expensesByCategory: Record<ExpenseCategory, number>;
  profitMargin: number;         // netProfit / totalSaleRevenue * 100
  costPerHead: number;          // (totalPurchaseCost + totalExpenses) / totalPurchased
}

export type TransactionType = 'purchase' | 'sale' | 'expense' | 'loss';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  amount: number;       // positive for income, negative for expense/loss
  details: Purchase | Sale | Expense | Loss;
}
