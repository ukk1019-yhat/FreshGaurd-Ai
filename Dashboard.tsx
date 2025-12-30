import React from 'react';
import { InventoryItem } from '../types';
import { AlertCircle, CheckCircle, Trash2, Edit3, Droplet, Beef, Carrot, Apple, Milk, Coffee, Package } from 'lucide-react';

interface DashboardProps {
  items: InventoryItem[];
  onConsume: (id: string) => void;
  onWaste: (id: string) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'Dairy': return <Milk className="text-blue-500" />;
    case 'Meat': return <Beef className="text-red-500" />;
    case 'Vegetable': return <Carrot className="text-orange-500" />;
    case 'Fruit': return <Apple className="text-red-400" />;
    case 'Beverage': return <Coffee className="text-amber-700" />;
    case 'Pantry': return <Package className="text-slate-600" />;
    default: return <Droplet className="text-slate-400" />;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ items, onConsume, onWaste, onDelete }) => {
  // Logic to determine freshness status based on dates
  const sortedItems = [...items]
    .filter(i => i.status === 'Fresh' || i.status === 'Expiring Soon')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'bg-red-50 border-red-200'; // Expired
    if (days <= 3) return 'bg-orange-50 border-orange-200'; // Critical
    if (days <= 7) return 'bg-yellow-50 border-yellow-200'; // Warning
    return 'bg-white border-slate-100'; // Good
  };

  return (
    <div className="pb-20 pt-4 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Fridge</h1>
        <p className="text-slate-500 text-sm">You have {sortedItems.length} items tracked.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
          <div className="text-2xl font-bold">{sortedItems.filter(i => getDaysRemaining(i.expiryDate) > 3).length}</div>
          <div className="text-emerald-100 text-sm">Fresh Items</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-md">
          <div className="text-2xl font-bold">{sortedItems.filter(i => getDaysRemaining(i.expiryDate) <= 3).length}</div>
          <div className="text-orange-100 text-sm">Expiring Soon</div>
        </div>
      </div>

      <h3 className="font-semibold text-slate-700 mb-3 text-lg">Inventory</h3>
      
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>No items yet. Tap "Add" to start.</p>
          </div>
        ) : (
          sortedItems.map(item => {
            const days = getDaysRemaining(item.expiryDate);
            return (
              <div key={item.id} className={`p-4 rounded-xl border shadow-sm relative ${getStatusColor(days)} transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.quantity} • {item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${days <= 3 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {days < 0 ? 'Expired' : days === 0 ? 'Expires Today' : `${days} days left`}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-end space-x-2">
                   <button 
                    onClick={() => onWaste(item.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                   >
                     <Trash2 size={14} /> <span>Wasted</span>
                   </button>
                   <button 
                    onClick={() => onConsume(item.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                   >
                     <CheckCircle size={14} /> <span>Consumed</span>
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;