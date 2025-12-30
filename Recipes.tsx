import React, { useState, useEffect } from 'react';
import { InventoryItem, RecipeRecommendation } from '../types';
import { getRecipes } from '../services/geminiService';
import { ChefHat, Clock, Sparkles } from 'lucide-react';

interface RecipesProps {
  items: InventoryItem[];
}

const Recipes: React.FC<RecipesProps> = ({ items }) => {
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter only available items
  const availableItems = items.filter(i => i.status === 'Fresh' || i.status === 'Expiring Soon');

  const fetchRecipes = async () => {
    setLoading(true);
    const recs = await getRecipes(availableItems);
    setRecommendations(recs);
    setLoading(false);
  };

  useEffect(() => {
    if (availableItems.length > 0 && recommendations.length === 0) {
      fetchRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only load once on mount/view change to save API calls

  return (
    <div className="pb-20 pt-4 px-4 min-h-screen bg-slate-50">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Smart Kitchen</h1>
          <p className="text-slate-500 text-sm">Recipes based on what you have.</p>
        </div>
        <button 
          onClick={fetchRecipes}
          disabled={loading}
          className="p-2 bg-primary text-white rounded-full shadow-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          <Sparkles size={20} />
        </button>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl h-40 animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
           <ChefHat size={48} className="mx-auto mb-4 opacity-50"/>
           <p>Add items to your inventory to get AI recipes!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">{rec.title}</h3>
                  <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    <Clock size={12} className="mr-1" /> {rec.cookingTime}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4">{rec.description}</p>
                
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Using Your Inventory</h4>
                    <div className="flex flex-wrap gap-2">
                        {rec.ingredientsUsed.map((ing, idx) => (
                            <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                {rec.missingIngredients.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">You Need</h4>
                         <div className="flex flex-wrap gap-2">
                            {rec.missingIngredients.map((ing, idx) => (
                                <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipes;