import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, RecipeRecommendation } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is assumed to be available per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION_PARSER = `
You are a smart grocery assistant. 
Your job is to extract product details from text or images.
Always estimate an expiry date if one is not explicitly visible or stated, based on general shelf life logic (e.g., Milk ~7 days, Bananas ~5 days).
Return confidence level for the expiry date (High if explicit, Medium/Low if estimated).
Current Date: ${new Date().toISOString().split('T')[0]}
`;

export const parseItemFromText = async (text: string): Promise<Partial<InventoryItem>[]> => {
  if (!process.env.API_KEY) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PARSER,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Dairy', 'Vegetable', 'Fruit', 'Meat', 'Pantry', 'Beverage', 'Other'] },
              quantity: { type: Type.STRING },
              expiryDate: { type: Type.STRING, description: "ISO 8601 Date String YYYY-MM-DD" },
              confidenceLevel: { type: Type.NUMBER, description: "0.0 to 1.0" },
              notes: { type: Type.STRING, description: "Storage tips or reasoning for date" }
            },
            required: ['name', 'category', 'expiryDate', 'confidenceLevel']
          }
        }
      }
    });

    const result = JSON.parse(response.text || '[]');
    return result;
  } catch (error) {
    console.error("Gemini Text Parse Error:", error);
    return [];
  }
};

export const parseItemFromImage = async (base64Image: string): Promise<Partial<InventoryItem>> => {
  if (!process.env.API_KEY) return {};

  try {
    // Using flash-image for vision capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identify the main product in this image. Estimate expiry if not visible." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PARSER,
        responseMimeType: "application/json",
        // Note: Response schema support varies for vision models, so we prompt for JSON structure in text if needed, 
        // but 2.5-flash-image handles JSON output well with mimeType set.
      }
    });

    // Clean up potential markdown code blocks if the model adds them (safety net)
    const rawText = response.text || '{}';
    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // The vision model might return a single object or array, handle both
    const result = JSON.parse(jsonString);
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error("Gemini Image Parse Error:", error);
    return {};
  }
};

export const getRecipes = async (items: InventoryItem[]): Promise<RecipeRecommendation[]> => {
  if (!process.env.API_KEY || items.length === 0) return [];

  const itemNames = items.map(i => `${i.name} (Expires: ${i.expiryDate})`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 recipes to use up these ingredients, prioritizing those expiring soon: ${itemNames}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingTime: { type: Type.STRING },
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};
