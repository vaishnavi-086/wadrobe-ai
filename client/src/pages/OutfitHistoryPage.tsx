import React, { useState, useEffect } from 'react';
import { 
  History, 
  Calendar, 
  Star, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { WearHistoryItem } from '../types';
import { api } from '../services/api';

interface OutfitHistoryPageProps {
  onNavigate: (tab: string) => void;
}

export const OutfitHistoryPage: React.FC<OutfitHistoryPageProps> = ({
  onNavigate
}) => {
  const [history, setHistory] = useState<WearHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await api.getWearHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRate = async (id: string, newRating: number) => {
    try {
      await api.rateWearHistory(id, newRating);
      setHistory(prev => prev.map(item => item.id === id ? { ...item, rating: newRating } : item));
    } catch (err: any) {
      alert(`Rating failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-terracotta" />
            <span>Wear Journal & Anti-Repetition</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Outfit History & Wear Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking your past outfits ensures the AI Stylist never suggests repeated looks within 48 hours.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recommender')}
          className="px-5 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs sm:text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 self-start sm:self-auto shadow"
        >
          <Sparkles className="w-4 h-4 text-[#f4d06f]" />
          <span>Ask AI Stylist</span>
        </button>
      </div>

      {/* Information Banner */}
      <div className="bg-sand-100/80 rounded-2xl p-4 sm:p-5 border border-sand-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-charcoal-800 space-y-1">
          <p className="font-semibold">How WardrobeAI Uses Your History:</p>
          <p className="text-gray-600 leading-relaxed">
            Every logged outfit automatically applies a temporary repetition penalty to its items. Shirts or pants worn yesterday won't be prioritized again today, encouraging balanced rotation across your entire closet.
          </p>
        </div>
      </div>

      {/* History Timeline */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-28 bg-sand-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-sand-100 rounded-2xl animate-pulse" />
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-sand-300 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-charcoal-900 bg-sand-100 px-2.5 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-terracotta" />
                    {log.worn_date}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-charcoal-700 font-medium">
                    Occasion: {log.occasion}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {log.weather_desc}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  {log.outfit_name}
                </h3>

                <p className="text-xs sm:text-sm text-charcoal-700 bg-sand-50/70 p-3 rounded-xl border border-sand-200">
                  {log.items_summary}
                </p>

                {log.notes && (
                  <p className="text-xs text-gray-500 italic">
                    "{log.notes}"
                  </p>
                )}
              </div>

              {/* Star Rating Section */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-sand-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                <span className="text-xs text-gray-400 mb-1 font-medium">
                  Rate Outfit:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(log.id, star)}
                      className="p-1 hover:scale-125 transition-transform"
                      title={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (log.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto text-charcoal-400">
            <History className="w-6 h-6 text-terracotta" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            No Outfits Logged Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            As you wear recommended outfits or save combinations, mark them as "Worn Today" to start your wear timeline.
          </p>
          <button
            onClick={() => onNavigate('recommender')}
            className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black"
          >
            Get an Outfit Recommendation
          </button>
        </div>
      )}

    </div>
  );
};
