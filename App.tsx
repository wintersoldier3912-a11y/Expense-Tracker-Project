
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Expense, User } from './types';
import { mockApiService } from './services/mockApi';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';

const PAGE_SIZE = 10;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<'dashboard' | 'list' | 'settings' | 'categories' | 'login'>('login');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const [expData, catData] = await Promise.all([
        mockApiService.getExpenses(),
        mockApiService.getCategories()
      ]);
      setExpenses(expData.items);
      setCategories(catData);
    } catch (err) {
      console.error("Init error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('xpense_token');
    const storedUser = localStorage.getItem('xpense_user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      setView('dashboard');
      init();
    } else {
      setLoading(false);
    }
  }, [init]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = { 
      id: 'u1', 
      name: 'Demo User', 
      email: 'demo@xpense.com', 
      preferences: { currency: 'INR', notifications: true } 
    };
    localStorage.setItem('xpense_token', 'mock_jwt');
    localStorage.setItem('xpense_user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
    setView('dashboard');
    init();
  };

  const updateProfile = async (data: Partial<User>) => {
    setActionLoading(true);
    try {
      const updated = await mockApiService.updateProfile(data);
      setUser(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCat = async (name: string, color: string) => {
    setActionLoading(true);
    try {
      const newCat = await mockApiService.saveCategory({ name, color });
      setCategories(prev => [...prev, newCat]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCat = async (id: string, name: string, color: string) => {
    setActionLoading(true);
    try {
      const updatedCat = await mockApiService.saveCategory({ id, name, color });
      setCategories(prev => prev.map(c => c.id === id ? updatedCat : c));
      setEditingCategoryId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (categories.length <= 1) {
      alert("You must have at least one category.");
      return;
    }
    if (!confirm("Deleting this category will reassign its expenses. Continue?")) return;
    setActionLoading(true);
    try {
      await mockApiService.deleteCategory(id);
      const updatedCats = categories.filter(c => c.id !== id);
      setCategories(updatedCats);
      const expData = await mockApiService.getExpenses();
      setExpenses(expData.items);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCat = filterCategory === 'all' || e.categoryId === filterCategory;
      const matchFrom = !filterDateFrom || new Date(e.date) >= new Date(filterDateFrom);
      const matchTo = !filterDateTo || new Date(e.date) <= new Date(filterDateTo + 'T23:59:59');
      return matchCat && matchFrom && matchTo;
    });
  }, [expenses, filterCategory, filterDateFrom, filterDateTo]);

  const pagedExpenses = filteredExpenses.slice(0, displayLimit);
  const hasMore = displayLimit < filteredExpenses.length;

  const handleLoadMore = () => {
    setActionLoading(true);
    setTimeout(() => {
      setDisplayLimit(prev => prev + PAGE_SIZE);
      setActionLoading(false);
    }, 400);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse text-sm">Loading your vault...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-xl rotate-3">X</div>
        <h1 className="text-3xl font-black mb-2 text-slate-800">XpensePro</h1>
        <p className="text-slate-500 mb-8 font-medium">Production-ready finance tracker</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email" defaultValue="demo@xpense.com" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-100 font-semibold" />
          <input required type="password" placeholder="Password" defaultValue="password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-100 font-semibold" />
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]">Login</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 max-w-lg mx-auto px-4 pt-8">
      {actionLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-700">Syncing...</span>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Account Overview</p>
          <h2 className="text-2xl font-black text-slate-800 truncate max-w-[200px]">{user?.name}</h2>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setView('categories')} 
             className={`w-11 h-11 rounded-2xl shadow-sm border flex items-center justify-center transition-all active:scale-90 ${view === 'categories' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
             aria-label="Manage Categories"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
           </button>
           <button 
             onClick={() => setView('settings')} 
             className={`w-11 h-11 rounded-2xl shadow-sm border flex items-center justify-center transition-all active:scale-90 ${view === 'settings' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
             aria-label="Profile Settings"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" /></svg>
           </button>
        </div>
      </header>

      <main className="animate-in fade-in duration-500 slide-in-from-bottom-4">
        {view === 'dashboard' && <Dashboard expenses={expenses} categories={categories} onAddClick={() => { setEditingExpense(undefined); setIsFormOpen(true); }} currency={user?.preferences.currency || 'INR'} />}

        {view === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">History</h2>
              <button 
                onClick={() => { setFilterCategory('all'); setFilterDateFrom(''); setFilterDateTo(''); setDisplayLimit(PAGE_SIZE); }}
                className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Clear Filters
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setFilterCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterCategory === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border text-slate-400'}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filterCategory === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border text-slate-400'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <p className="text-[10px] font-black text-slate-400 mb-1 ml-1 uppercase">From</p>
                  <input 
                    type="date" 
                    value={filterDateFrom} 
                    onChange={e => setFilterDateFrom(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black text-slate-400 mb-1 ml-1 uppercase">To</p>
                  <input 
                    type="date" 
                    value={filterDateTo} 
                    onChange={e => setFilterDateTo(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {pagedExpenses.length === 0 ? (
                 <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">No transactions found.</p>
                 </div>
              ) : (
                <>
                  {pagedExpenses.map(e => {
                    const cat = categories.find(c => c.id === e.categoryId);
                    return (
                      <div key={e.id} className="bg-white p-4 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-100 group transition-all hover:border-indigo-100 active:scale-[0.99] animate-in slide-in-from-right duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: cat?.color }}>{cat?.name[0]}</div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{cat?.name || 'Deleted'}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 truncate max-w-[120px]">{e.note || 'No note'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                             <p className="font-black text-slate-900">{user?.preferences.currency} {e.amount.toLocaleString()}</p>
                             <p className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString()}</p>
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingExpense(e); setIsFormOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18.364H8v-4L18.364 5.364z" /></svg></button>
                              <button onClick={async () => {
                                 if(confirm("Delete this expense?")) {
                                   await mockApiService.deleteExpense(e.id);
                                   setExpenses(prev => prev.filter(item => item.id !== e.id));
                                 }
                              }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {hasMore && (
                    <button 
                      onClick={handleLoadMore}
                      className="w-full py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-colors mt-2"
                    >
                      Show More Transactions
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-10 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Account</h2>
                <p className="text-sm text-slate-400 font-medium">Manage your profile and settings</p>
              </div>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Info</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Display Name</label>
                    <input 
                      value={user?.name || ''} 
                      onChange={e => updateProfile({ name: e.target.value })} 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-700 border border-transparent focus:bg-white" 
                      placeholder="Enter name" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                    <input 
                      value={user?.email || ''} 
                      onChange={e => updateProfile({ email: e.target.value })} 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-700 border border-transparent focus:bg-white" 
                      placeholder="Enter email" 
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferences</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-3 text-slate-600 font-bold">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Currency
                    </div>
                    <select 
                      value={user?.preferences.currency} 
                      onChange={e => updateProfile({ preferences: { ...user!.preferences, currency: e.target.value } })} 
                      className="bg-transparent font-black text-indigo-600 outline-none cursor-pointer text-right"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-3 text-slate-600 font-bold">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Notifications
                    </div>
                    <button 
                      onClick={() => updateProfile({ preferences: { ...user!.preferences, notifications: !user!.preferences.notifications } })}
                      className={`w-12 h-6 rounded-full transition-all relative ${user?.preferences.notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      role="switch"
                      aria-checked={user?.preferences.notifications}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user?.preferences.notifications ? 'right-1 shadow-sm' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Management</p>
                <button 
                  onClick={() => setView('categories')} 
                  className="w-full flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3 text-slate-600 font-bold">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Manage Categories
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </section>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to sign out?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }} 
                className="w-full p-4 text-red-500 font-black bg-red-50/50 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout Securely
              </button>
            </div>
          </div>
        )}

        {view === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <button onClick={() => setView('settings')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-xl text-slate-500 shadow-sm active:scale-90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <h2 className="text-xl font-black text-slate-800">Categories</h2>
               </div>
               <button onClick={() => setView('dashboard')} className="text-indigo-600 font-black text-sm uppercase tracking-tighter hover:underline">Done</button>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
               <div className="space-y-3">
                 {categories.map(c => (
                   <div key={c.id} className="bg-slate-50 p-4 rounded-3xl transition-all group border border-transparent hover:border-indigo-100">
                     {editingCategoryId === c.id ? (
                       <form 
                         onSubmit={(e) => {
                           e.preventDefault();
                           const target = e.target as any;
                           handleUpdateCat(c.id, target.name.value, target.color.value);
                         }}
                         className="flex flex-col gap-3 animate-in fade-in zoom-in duration-200"
                       >
                         <div className="flex gap-2">
                           <input 
                             name="name" 
                             autoFocus
                             defaultValue={c.name} 
                             className="flex-1 p-3 bg-white rounded-xl outline-none border focus:border-indigo-500 font-bold text-slate-700" 
                           />
                           <input 
                             name="color" 
                             type="color" 
                             defaultValue={c.color} 
                             className="w-12 h-12 bg-white rounded-xl cursor-pointer p-1 border" 
                           />
                         </div>
                         <div className="flex gap-2">
                           <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-100">Save</button>
                           <button type="button" onClick={() => setEditingCategoryId(null)} className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold">Cancel</button>
                         </div>
                       </form>
                     ) : (
                       <div className="flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-lg shadow-sm ring-2 ring-white" style={{ backgroundColor: c.color }}></div>
                            <span className="font-bold text-slate-700">{c.name}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setEditingCategoryId(c.id)} 
                              className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Edit Category"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              disabled={categories.length <= 1}
                              onClick={() => handleDeleteCat(c.id)} 
                              className="p-2 text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                              title="Delete Category"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
               
               <div className="pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">New Category</p>
                 <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    const target = e.target as any; 
                    const n = target.name.value; 
                    const c = target.color.value; 
                    if(n.trim()) {
                      handleAddCat(n, c); 
                      target.reset(); 
                    }
                 }} className="flex gap-2">
                    <input name="name" placeholder="E.g. Netflix" required className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                    <input name="color" type="color" defaultValue="#6366f1" className="w-14 h-14 p-1 bg-slate-50 rounded-2xl cursor-pointer border-none shadow-inner" title="Pick Color" />
                    <button type="submit" className="w-14 h-14 bg-indigo-600 text-white rounded-2xl font-black text-xl flex items-center justify-center active:scale-95 shadow-lg shadow-indigo-100/50" aria-label="Add Category">+</button>
                 </form>
               </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-200/50 rounded-full p-2.5 flex gap-2 border border-white/50 z-40">
        <button 
          onClick={() => setView('dashboard')} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300 hover:text-slate-500'}`}
          aria-label="Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button 
          onClick={() => { setView('list'); setDisplayLimit(PAGE_SIZE); }} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${view === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300 hover:text-slate-500'}`}
          aria-label="Transaction List"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </button>
        <div className="w-px h-8 bg-slate-100 my-auto mx-1"></div>
        <button 
          onClick={() => setView('settings')} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300 hover:text-slate-500'}`}
          aria-label="Profile Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" /></svg>
        </button>
      </nav>

      {isFormOpen && (
        <ExpenseForm 
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSubmit={async (data) => {
            setActionLoading(true);
            try {
              if(editingExpense) {
                const updated = await mockApiService.updateExpense(editingExpense.id, data);
                setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
              } else {
                const added = await mockApiService.addExpense(data);
                setExpenses(prev => [added, ...prev]);
              }
              setIsFormOpen(false);
              setEditingExpense(undefined);
            } finally {
              setActionLoading(false);
            }
          }}
          initialData={editingExpense}
          loading={actionLoading}
          currency={user?.preferences.currency || 'INR'}
        />
      )}
    </div>
  );
};

export default App;
