import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = ({ data }) => {
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Simple streak calculation (based on expense logs)
  const getStreak = () => {
    const dates = [...new Set(data.expenses.map(e => e.date.split('T')[0]))].sort().reverse();
    if (dates.length === 0) return 0;
    
    let streak = 0;
    let today = new Date();
    
    // Check for today or yesterday
    if (new Date(dates[0]).toDateString() === today.toDateString()) {
      streak = 1;
    } else {
      today.setDate(today.getDate() - 1);
      if (new Date(dates[0]).toDateString() === today.toDateString()) {
        streak = 1;
      } else {
        return 0; // Streak broken
      }
    }
    
    for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i]);
        const next = new Date(dates[i+1]);
        current.setDate(current.getDate() - 1);
        if (current.toDateString() === next.toDateString()) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  };

  const chartData = [
    { name: 'Income', value: totalIncome, fill: '#34D399' },
    { name: 'Expenses', value: totalExpenses, fill: '#F87171' },
  ];

  const StatCard = ({ title, value, colorClass }) => (
    <div className="bg-base-200 p-6 rounded-xl shadow-lg flex-1">
      <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
      {/* CHANGED: Swapped $ for ₦ */}
      <p className={`text-3xl font-bold ${colorClass}`}>₦{value.toLocaleString('en-NG')}</p>
    </div>
  );


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" value={totalIncome} colorClass="text-accent" />
        <StatCard title="Total Expenses" value={totalExpenses} colorClass="text-red-400" />
        <StatCard title="Net Balance" value={netBalance} colorClass={netBalance >= 0 ? 'text-blue-400' : 'text-red-400'} />
      </div>
      
      <div className="bg-base-200 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Financial Overview</h3>
            <div className="text-right">
                <p className="text-text-secondary text-sm">Daily Quest Streak</p>
                <p className="text-2xl font-bold text-accent">🔥 {getStreak()}</p>
            </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#2A323C'}} contentStyle={{backgroundColor: '#1D232A', border: '1px solid #4A5568'}} />
              <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;