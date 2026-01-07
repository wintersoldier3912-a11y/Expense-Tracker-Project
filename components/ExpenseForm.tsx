
import React, { useState, useEffect } from 'react';
import { Category, Expense } from '../types';

interface ExpenseFormProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: Partial<Expense>) => void;
  initialData?: Expense;
  loading: boolean;
  currency: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, onClose, onSubmit, initialData, loading, currency }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    amount: 0,
    categoryId: categories[0]?.id || '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    currency: currency
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Edit' : 'New'} Expense</h2>
          <button onClick={onClose} className="text-slate-400 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Amount ({currency})</label>
            <input required type="number" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Note</label>
            <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 h-20" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            {loading ? 'Processing...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
