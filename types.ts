export type Category = 'Dairy' | 'Vegetable' | 'Fruit' | 'Meat' | 'Pantry' | 'Beverage' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: string;
  addedDate: string; // ISO String
  expiryDate: string; // ISO String
  status: 'Fresh' | 'Expiring Soon' | 'Expired' | 'Consumed' | 'Wasted';
  confidenceLevel?: number; // 0 to 1, for AI estimates
  notes?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  isChecked: boolean;
  category: Category;
}

export interface AnalyticsData {
  wastedValue: number;
  wastedCount: number;
  consumedCount: number;
  monthlySavings: number;
  categoryBreakdown: { name: string; value: number }[];
}

export interface RecipeRecommendation {
  id: string;
  title: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  cookingTime: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADD_ITEM = 'ADD_ITEM',
  GROCERY_LIST = 'GROCERY_LIST',
  RECIPES = 'RECIPES',
  ANALYTICS = 'ANALYTICS'
}
