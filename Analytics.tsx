import React from 'react';
import { InventoryItem, AnalyticsData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsProps {
  items: InventoryItem[];
}

const Analytics: React.FC<AnalyticsProps> = ({ items }) => {
  // Mock calculations for demo purposes since we don't have price data in the basic schema
  // In a real app, user would input price or AI would estimate it.
  const wastedItems = items.filter(i => i.status === 'Wasted');
  const consumedItems = items.filter(i => i.status === 'Consumed');
  
  const estimatedAvgPrice = 80; // INR
  const wastedValue = wastedItems.length * estimatedAvgPrice;
  const savedValue = consumedItems.length * estimatedAvgPrice;

  const data = [
    { name: 'Consumed', value: consumedItems.length, color: '#10b981' }, // Emerald
    { name: 'Wasted', value: wastedItems.length, color: '#ef4444' },    // Red
  ];

  const monthlyData = [
    { name: 'Week 1', consumed: 12, wasted: 2 },
    { name: 'Week 2', consumed: 18, wasted: 1 },
    { name: 'Week 3', consumed: 15, wasted: 3 },
    { name: 'Week 4', consumed: consumedItems.length, wasted: wastedItems.length },
  ];

  return (
    <div className="pb-20 pt-4 px-4 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Impact Tracker</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center space-x-2 text-slate-500 mb-1">
             <TrendingDown size={16} />
             <span className="text-xs font-medium">Loss (Est.)</span>
           </div>
           <div className="text-2xl font-bold text-red-500 flex items-center">
             <IndianRupee size={20} /> {wastedValue}
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center space-x-2 text-slate-500 mb-1">
             <TrendingUp size={16} />
             <span className="text-xs font-medium">Value Saved</span>
           </div>
           <div className="text-2xl font-bold text-emerald-500 flex items-center">
             <IndianRupee size={20} /> {savedValue}
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <h3 className="font-semibold text-slate-700 mb-4">Consumption Ratio</h3>
        <div className="h-64 w-full">
            {items.filter(i => i.status === 'Consumed' || i.status === 'Wasted').length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">Not enough data</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
        <div className="flex justify-center gap-6 mt-2">
            {data.map((d) => (
                <div key={d.name} className="flex items-center text-sm text-slate-600">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                    {d.name}
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4">Monthly Trends</h3>
        <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                    <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                    <YAxis fontSize={12} stroke="#94a3b8" />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="consumed" name="Consumed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wasted" name="Wasted" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Analytics;