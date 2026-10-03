export type Category = 
  | 'Shirt' 
  | 'T-shirt' 
  | 'Trousers' 
  | 'Jeans' 
  | 'Dress' 
  | 'Skirt' 
  | 'Jacket' 
  | 'Blazer' 
  | 'Shoes' 
  | 'Accessories' 
  | 'Other';

export type Color = 
  | 'Black' 
  | 'White' 
  | 'Blue' 
  | 'Red' 
  | 'Green' 
  | 'Yellow' 
  | 'Brown' 
  | 'Beige' 
  | 'Grey' 
  | 'Other';

export type Pattern = 
  | 'Solid' 
  | 'Striped' 
  | 'Checked' 
  | 'Printed' 
  | 'Floral' 
  | 'Other';

export type Style = 
  | 'Formal' 
  | 'Casual' 
  | 'Semi-formal' 
  | 'Sporty' 
  | 'Traditional';

export type Season = 
  | 'Summer' 
  | 'Winter' 
  | 'Monsoon' 
  | 'All season';

export interface ClothingItem {
  id: string;
  name: string;
  image_url: string;
  category: Category;
  color: Color;
  pattern: Pattern;
  style: Style;
  season: Season;
  formality: number; // 1 to 5
  created_at: string;
  last_worn?: string | null;
  notes?: string;
  slot_type?: string;
}

export interface WeatherInfo {
  city: string;
  targetDate: string;
  condition: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  precipitationProb: number;
  icon: 'sun' | 'rain' | 'cold' | 'partly-cloudy';
  isRainy: boolean;
  isCold: boolean;
  isHot: boolean;
  advice: string;
  isSimulated?: boolean;
  source?: string;
}

export interface OutfitRecommendation {
  items: ClothingItem[];
  score: number;
  breakdown: string[];
  whyThisOutfit: string[];
  slotMap: {
    top?: ClothingItem;
    bottom?: ClothingItem;
    shoes?: ClothingItem;
    outerwear?: ClothingItem;
    accessory?: ClothingItem;
  };
}

export interface RecommendationResponse {
  success: boolean;
  error?: string;
  query: string;
  constraints: {
    rawPrompt: string;
    targetDate: string;
    occasion: string;
    targetFormality: number;
    inclusions: string[];
    exclusions: string[];
    count: number;
  };
  weather: WeatherInfo;
  primaryOutfit: OutfitRecommendation;
  additionalOutfits: OutfitRecommendation[];
  alternatives: OutfitRecommendation[];
  totalCombinationsEvaluated: number;
  aiDifferentiator: {
    tagline: string;
    guarantee: string;
  };
}

export interface SavedOutfit {
  id: string;
  name: string;
  occasion: string;
  weather_summary: string;
  why_explanation: string;
  score: number;
  created_at: string;
  items: ClothingItem[];
}

export interface WearHistoryItem {
  id: string;
  outfit_id?: string;
  outfit_name: string;
  items_summary: string;
  worn_date: string;
  occasion: string;
  weather_desc: string;
  rating: number;
  notes?: string;
}

export interface DashboardStats {
  totalItems: number;
  tops: number;
  bottoms: number;
  shoes: number;
  outerwear: number;
  savedOutfits: number;
}
