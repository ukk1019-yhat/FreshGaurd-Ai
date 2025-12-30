import React from 'react';
import { Home, PlusCircle, ShoppingCart, ChefHat, BarChart2 } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Home' },
    { view: AppView.RECIPES, icon: ChefHat, label: 'Recipes' },
    { view: AppView.ADD_ITEM, icon: PlusCircle, label: 'Add', isMain: true },
    { view: AppView.GROCERY_LIST, icon: ShoppingCart, label: 'List' },
    { view: AppView.ANALYTICS, icon: BarChart2, label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === item.view ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <item.icon
              size={item.isMain ? 32 : 24}
              className={item.isMain ? 'text-primary -mt-4 bg-white rounded-full p-1 shadow-sm border border-slate-100' : ''}
              fill={currentView === item.view && !item.isMain ? "currentColor" : "none"}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;