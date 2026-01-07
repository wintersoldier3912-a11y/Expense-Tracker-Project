
import { Category, Expense, User } from '../types';

const STORAGE_KEYS = {
  USER: 'xpense_user',
  TOKEN: 'xpense_token',
  EXPENSES: 'xpense_expenses',
  CATEGORIES: 'xpense_categories'
};

const defaultCategories: Category[] = [
  { id: 'cat1', name: 'Food', color: '#6366f1' },
  { id: 'cat2', name: 'Transport', color: '#10b981' },
  { id: 'cat3', name: 'Shopping', color: '#f59e0b' },
  { id: 'cat4', name: 'Bills', color: '#ef4444' },
  { id: 'cat5', name: 'Other', color: '#8b5cf6' }
];

const initialExpenses: Expense[] = [
  { id: '1', amount: 1200, currency: 'INR', date: new Date().toISOString(), categoryId: 'cat1', note: 'Dinner at Taj', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', amount: 450, currency: 'INR', date: new Date(Date.now() - 86400000).toISOString(), categoryId: 'cat2', note: 'Uber to Office', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockApiService = {
  // Profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    await new Promise(r => setTimeout(r, 600));
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const updated = { ...current, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    await new Promise(r => setTimeout(r, 300));
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : defaultCategories;
  },

  saveCategory: async (cat: Partial<Category>): Promise<Category> => {
    await new Promise(r => setTimeout(r, 500));
    const categories = await mockApiService.getCategories();
    if (cat.id) {
      const idx = categories.findIndex(c => c.id === cat.id);
      categories[idx] = { ...categories[idx], ...cat };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return categories[idx];
    } else {
      const newCat: Category = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: cat.name!, 
        color: cat.color || '#6366f1' 
      };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([...categories, newCat]));
      return newCat;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 500));
    const categories = await mockApiService.getCategories();
    const updated = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    
    // Cleanup: Point expenses with deleted category to 'Other' if it exists, or first available
    const expensesStored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (expensesStored) {
      const expenses: Expense[] = JSON.parse(expensesStored);
      const cleaned = expenses.map(e => e.categoryId === id ? { ...e, categoryId: updated[0]?.id || '' } : e);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(cleaned));
    }
  },

  // Expenses
  getExpenses: async (): Promise<{ items: Expense[] }> => {
    await new Promise(r => setTimeout(r, 400));
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return { items: stored ? JSON.parse(stored) : initialExpenses };
  },

  addExpense: async (expenseData: Partial<Expense>): Promise<Expense> => {
    await new Promise(r => setTimeout(r, 600));
    const expenses = (await mockApiService.getExpenses()).items;
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount: expenseData.amount || 0,
      currency: expenseData.currency || 'INR',
      date: expenseData.date || new Date().toISOString(),
      categoryId: expenseData.categoryId || 'cat5',
      note: expenseData.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([newExpense, ...expenses]));
    return newExpense;
  },

  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    await new Promise(r => setTimeout(r, 600));
    const expenses = (await mockApiService.getExpenses()).items;
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("Not found");
    expenses[idx] = { ...expenses[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return expenses[idx];
  },

  deleteExpense: async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 400));
    const expenses = (await mockApiService.getExpenses()).items;
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses.filter(e => e.id !== id)));
  }
};
