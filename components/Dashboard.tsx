
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Category, Expense } from '../types';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  onAddClick: () => void;
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, categories, onAddClick, currency }) => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0),
    color: cat.color
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Spending</p>
          <h2 className="text-4xl font-bold mt-2">{currency} {total.toLocaleString()}</h2>
          <div className="mt-6">
             <button 
               onClick={onAddClick}
               className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-semibold shadow-sm hover:bg-indigo-50 transition-colors"
             >
               Add Expense
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-xs text-slate-500 truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {expenses.slice(0, 4).map(e => {
              const cat = categories.find(c => c.id === e.categoryId);
              return (
                <div key={e.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cat?.color }}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{cat?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-800">{currency} {e.amount}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
