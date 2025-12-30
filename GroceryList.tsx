import React, { useState } from 'react';
import { GroceryItem, Category } from '../types';
import { Plus, CheckSquare, Square, Trash2 } from 'lucide-react';

interface GroceryListProps {
  list: GroceryItem[];
  setList: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

const GroceryList: React.FC<GroceryListProps> = ({ list, setList }) => {
  const [newItemName, setNewItemName] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName,
      isChecked: false,
      category: 'Other'
    };
    setList([...list, newItem]);
    setNewItemName('');
  };

  const toggleCheck = (id: string) => {
    setList(list.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const deleteItem = (id: string) => {
    setList(list.filter(item => item.id !== id));
  };

  return (
    <div className="pb-20 pt-4 px-4 min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Shopping List</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 mb-6 flex">
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add item..."
          className="flex-1 p-2 outline-none text-slate-700"
        />
        <button onClick={addItem} className="bg-primary text-white p-2 rounded-lg hover:bg-emerald-600 transition">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
            <p className="text-center text-slate-400 mt-10">Your list is empty.</p>
        )}
        {list.map(item => (
          <div key={item.id} className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100 group">
            <button onClick={() => toggleCheck(item.id)} className="mr-3 text-slate-400 hover:text-primary transition">
              {item.isChecked ? <CheckSquare className="text-primary" /> : <Square />}
            </button>
            <span className={`flex-1 font-medium ${item.isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.name}
            </span>
            <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Monetization / Future Feature Teaser */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
        <h3 className="text-sm font-bold text-blue-800 mb-1">Premium Feature</h3>
        <p className="text-xs text-blue-600">Auto-add items to this list when they expire in your fridge. Upgrade to Premium.</p>
      </div>
    </div>
  );
};

export default GroceryList;