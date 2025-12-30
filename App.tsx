import React, { useState, useEffect } from 'react';
import { AppView, InventoryItem, GroceryItem } from './types';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import AddItem from './components/AddItem';
import Recipes from './components/Recipes';
import Analytics from './components/Analytics';
import GroceryList from './components/GroceryList';

// Helper to calculate status based on date
const updateItemStatus = (item: InventoryItem): InventoryItem => {
  if (item.status === 'Consumed' || item.status === 'Wasted') return item;
  
  const now = new Date();
  const expiry = new Date(item.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: InventoryItem['status'] = 'Fresh';
  if (diffDays < 0) status = 'Expired';
  else if (diffDays <= 3) status = 'Expiring Soon';
  
  return { ...item, status };
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Initialize with some dummy data for first-time usage visualization
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Milk', category: 'Dairy', quantity: '1L', addedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Expiring Soon', confidenceLevel: 0.9 },
      { id: '2', name: 'Tomatoes', category: 'Vegetable', quantity: '500g', addedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Fresh', confidenceLevel: 0.8 },
    ];
  });

  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('groceryList');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist State
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }, [groceryList]);

  // Update statuses on mount
  useEffect(() => {
    setInventory(prev => prev.map(updateItemStatus));
  }, []);

  const addItem = (item: InventoryItem) => {
    // Check if status needs update immediately based on date entered
    const itemWithStatus = updateItemStatus(item);
    setInventory([...inventory, itemWithStatus]);
    setCurrentView(AppView.DASHBOARD);
  };

  const markConsumed = (id: string) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, status: 'Consumed' } : i));
  };

  const markWasted = (id: string) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, status: 'Wasted' } : i));
  };

  const deleteItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard items={inventory} onConsume={markConsumed} onWaste={markWasted} onDelete={deleteItem} />;
      case AppView.ADD_ITEM:
        return <AddItem onAdd={addItem} onCancel={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.RECIPES:
        return <Recipes items={inventory} />;
      case AppView.ANALYTICS:
        return <Analytics items={inventory} />;
      case AppView.GROCERY_LIST:
        return <GroceryList list={groceryList} setList={setGroceryList} />;
      default:
        return <Dashboard items={inventory} onConsume={markConsumed} onWaste={markWasted} onDelete={deleteItem} />;
    }
  };

  return (
    <div className="bg-background min-h-screen text-slate-800 font-sans">
       {/* If API Key is missing, show a subtle banner */}
       {!process.env.API_KEY && (
        <div className="bg-amber-100 text-amber-800 text-xs p-2 text-center">
            Demo Mode: Gemini API Key not found. AI features will be simulated or unavailable.
        </div>
       )}
      
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        {renderView()}
      </main>

      {currentView !== AppView.ADD_ITEM && (
        <div className="max-w-md mx-auto fixed bottom-0 left-0 right-0 z-50">
           <Navigation currentView={currentView} onChangeView={setCurrentView} />
        </div>
      )}
    </div>
  );
};

export default App;