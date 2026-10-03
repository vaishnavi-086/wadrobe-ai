import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Check, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavedOutfit, ClothingItem } from '../types';
import { api } from '../services/api';

interface SavedOutfitsPageProps {
  onSelectItem: (item: ClothingItem) => void;
  onNavigate: (tab: string) => void;
}

export const SavedOutfitsPage: React.FC<SavedOutfitsPageProps> = ({
  onSelectItem,
  onNavigate
}) => {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [wornId, setWornId] = useState<string | null>(null);

  const loadSaved = async () => {
    try {
      const data = await api.getSavedOutfits();
      setOutfits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from saved looks?`)) return;
    try {
      await api.deleteSavedOutfit(id);
      setOutfits(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleWear = async (outfit: SavedOutfit) => {
    try {
      const itemIds = outfit.items.map(i => i.id);
      await api.wearOutfit({
        outfit_id: outfit.id,
        outfit_name: outfit.name,
        item_ids: itemIds,
        occasion: outfit.occasion,
        weather_desc: outfit.weather_summary || 'Logged wear',
        rating: 5,
        notes: `Selected from saved looks`
      });

      setWornId(outfit.id);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err: any) {
      alert(`Error logging wear: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5 text-terracotta" />
            <span>Curated Combinations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Saved Outfits
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your personal lookbook of pre-assembled combinations ready to wear.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recommender')}
          className="px-5 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs sm:text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 self-start sm:self-auto shadow"
        >
          <Sparkles className="w-4 h-4 text-[#f4d06f]" />
          <span>Generate New Outfit</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-3xl bg-sand-100 animate-pulse" />
          <div className="h-64 rounded-3xl bg-sand-100 animate-pulse" />
        </div>
      ) : outfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outfits.map((outfit) => {
            const isWorn = wornId === outfit.id;
            return (
              <div
                key={outfit.id}
                className="bg-white rounded-3xl border border-sand-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-terracotta uppercase tracking-wider">
                        {outfit.occasion}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-charcoal-900 mt-0.5">
                        {outfit.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDelete(outfit.id, outfit.name)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items Row */}
                  <div className="grid grid-cols-4 gap-2.5 my-4">
                    {outfit.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className="bg-sand-50 rounded-2xl border border-sand-200 p-2 flex flex-col items-center cursor-pointer hover:border-charcoal-900 transition-all text-center"
                      >
                        <div className="aspect-square w-full rounded-xl bg-white p-1 mb-1.5 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image_url.startsWith('/uploads') ? `http://localhost:5000${item.image_url}` : item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-charcoal-900 line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Why explanation notes */}
                  {outfit.why_explanation && (
                    <div className="bg-sand-50/70 rounded-2xl p-3.5 border border-sand-200 text-xs text-charcoal-700 whitespace-pre-line leading-relaxed">
                      {outfit.why_explanation}
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div className="p-4 px-6 border-t border-sand-100 bg-sand-50/40 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">
                    Weather context: {outfit.weather_summary || 'All-weather'}
                  </span>

                  <button
                    onClick={() => handleWear(outfit)}
                    disabled={isWorn}
                    className={`px-4 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
                      isWorn
                        ? 'bg-emerald-600 text-white'
                        : 'bg-charcoal-900 text-white hover:bg-black'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isWorn ? 'Worn Today!' : 'Wear This Today'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto text-charcoal-400">
            <Bookmark className="w-6 h-6 text-terracotta" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            No Saved Outfits Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            When the AI Stylist generates a combination you love, click "Save Outfit" to keep it here for instant access.
          </p>
          <button
            onClick={() => onNavigate('recommender')}
            className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black"
          >
            Ask AI Stylist Now
          </button>
        </div>
      )}

    </div>
  );
};
