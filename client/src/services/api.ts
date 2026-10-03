import { 
  ClothingItem, 
  DashboardStats, 
  RecommendationResponse, 
  SavedOutfit, 
  WearHistoryItem, 
  WeatherInfo 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // 1. Dashboard Stats
  async getDashboardStats(): Promise<{ stats: DashboardStats; recentItems: ClothingItem[]; recentWorn: WearHistoryItem[] }> {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard stats');
    const data = await res.json();
    return data;
  },

  // 2. Wardrobe Items
  async getItems(filters: {
    category?: string;
    color?: string;
    style?: string;
    season?: string;
    search?: string;
    sort?: string;
  } = {}): Promise<ClothingItem[]> {
    const query = new URLSearchParams();
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.color && filters.color !== 'All') query.append('color', filters.color);
    if (filters.style && filters.style !== 'All') query.append('style', filters.style);
    if (filters.season && filters.season !== 'All') query.append('season', filters.season);
    if (filters.search) query.append('search', filters.search);
    if (filters.sort) query.append('sort', filters.sort);

    const res = await fetch(`${API_BASE_URL}/items?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load wardrobe items');
    const data = await res.json();
    return data.items || [];
  },

  async getItemById(id: string): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`);
    if (!res.ok) throw new Error('Failed to load item details');
    const data = await res.json();
    return data.item;
  },

  async createItem(itemData: Partial<ClothingItem>): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create item');
    }
    const data = await res.json();
    return data.item;
  },

  async updateItem(id: string, itemData: Partial<ClothingItem>): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to update item');
    const data = await res.json();
    return data.item;
  },

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  async markItemWorn(id: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/items/${id}/wear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark item as worn');
    const data = await res.json();
    return data.last_worn;
  },

  async resetDemoWardrobe(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/items/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo wardrobe');
  },

  // 3. AI Computer Vision
  async analyzeClothingImage(formData: FormData): Promise<{
    imageUrl: string;
    analysis: {
      category: string;
      color: string;
      pattern: string;
      style: string;
      season: string;
      formality: number;
      confidence: number;
      isMock: boolean;
      serviceProvider: string;
      detectedDetails?: string[];
    };
  }> {
    const res = await fetch(`${API_BASE_URL}/ai/analyze-clothing`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to analyze clothing image');
    }
    return await res.json();
  },

  async getAiStatus(): Promise<{ provider: string; active: boolean; isMock: boolean; notice?: string }> {
    const res = await fetch(`${API_BASE_URL}/ai/status`);
    if (!res.ok) return { provider: 'Heuristic Vision (Demo)', active: true, isMock: true };
    return await res.json();
  },

  // 4. Recommendation Engine
  async getRecommendation(params: {
    prompt: string;
    city?: string;
    weatherOverride?: string;
  }): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate outfit recommendation');
    }
    return await res.json();
  },

  // 5. Saved Outfits
  async getSavedOutfits(): Promise<SavedOutfit[]> {
    const res = await fetch(`${API_BASE_URL}/outfits/saved`);
    if (!res.ok) throw new Error('Failed to load saved outfits');
    const data = await res.json();
    return data.outfits || [];
  },

  async saveOutfit(data: {
    name: string;
    occasion: string;
    weather_summary: string;
    why_explanation: string[];
    score: number;
    item_ids: string[];
  }): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/outfits/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save outfit');
    const result = await res.json();
    return result.outfitId;
  },

  async deleteSavedOutfit(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/outfits/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete saved outfit');
  },

  async wearOutfit(data: {
    outfit_id?: string;
    outfit_name: string;
    item_ids: string[];
    occasion: string;
    weather_desc: string;
    rating?: number;
    notes?: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/outfits/wear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log worn outfit');
  },

  // 6. Wear History
  async getWearHistory(): Promise<WearHistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) throw new Error('Failed to load wear history');
    const data = await res.json();
    return data.history || [];
  },

  async rateWearHistory(id: string, rating: number, notes?: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/history/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, notes })
    });
    if (!res.ok) throw new Error('Failed to rate outfit');
  },

  // 7. Weather
  async getWeather(targetDate = 'today', city?: string): Promise<{ weather: WeatherInfo; presets: any[]; cities: string[] }> {
    const query = new URLSearchParams();
    if (targetDate) query.append('targetDate', targetDate);
    if (city) query.append('city', city);

    const res = await fetch(`${API_BASE_URL}/weather?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load weather');
    return await res.json();
  },

  async setWeatherPreset(preset: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/weather/preset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset })
    });
    if (!res.ok) throw new Error('Failed to set weather preset');
  }
};
