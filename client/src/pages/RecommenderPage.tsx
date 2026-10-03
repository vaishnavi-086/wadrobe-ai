import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  Bookmark, 
  Check, 
  CloudRain, 
  Sun, 
  Snowflake, 
  CloudSun, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Info,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  OutfitRecommendation, 
  RecommendationResponse, 
  ClothingItem, 
  WeatherInfo 
} from '../types';
import { api } from '../services/api';
import { HeroBanner } from '../components/HeroBanner';

interface RecommenderPageProps {
  initialPrompt?: string;
  weather: WeatherInfo | null;
  currentCity?: string;
  onNavigate: (tab: string) => void;
  onSelectItem: (item: ClothingItem) => void;
}

export const RecommenderPage: React.FC<RecommenderPageProps> = ({
  initialPrompt = '',
  weather,
  currentCity = 'New York',
  onNavigate,
  onSelectItem
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || 'I need something for a presentation tomorrow.');
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0); // 0 = primary, 1..N = alternatives
  const [isSaved, setIsSaved] = useState(false);
  const [isWornLogged, setIsWornLogged] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample prompt chips
  const samplePrompts = [
    'I have a presentation tomorrow',
    'I need something casual for college',
    'What should I wear if it rains tomorrow?',
    'Create a casual weekend outfit',
    'Use my blue shirt',
    'Don\'t use jeans',
    'Create 3 outfits for a 3-day trip'
  ];

  const handleRecommend = async (customText?: string) => {
    const textToRun = (customText || prompt).trim();
    if (!textToRun) return;

    setLoading(true);
    setErrorMessage('');
    setIsSaved(false);
    setIsWornLogged(false);
    setCurrentOutfitIndex(0);

    try {
      const res = await api.getRecommendation({
        prompt: textToRun,
        city: currentCity
      });

      if (!res.success) {
        setErrorMessage(res.error || 'No outfit could be generated.');
        setRecommendationData(null);
      } else {
        setRecommendationData(res);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to recommendation engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If an initial prompt was passed from Dashboard or Landing page, auto-run it
    if (initialPrompt) {
      setPrompt(initialPrompt);
      handleRecommend(initialPrompt);
    } else if (!recommendationData) {
      // Auto run default demo presentation query
      handleRecommend('I need something for a presentation tomorrow.');
    }
  }, [initialPrompt]);

  // Combine primary + alternatives into an easily cyclable list
  const availableOutfits: OutfitRecommendation[] = React.useMemo(() => {
    if (!recommendationData || !recommendationData.primaryOutfit) return [];
    return [recommendationData.primaryOutfit, ...(recommendationData.alternatives || [])];
  }, [recommendationData]);

  const activeOutfit = availableOutfits[currentOutfitIndex] || availableOutfits[0];

  const handleNextOutfit = () => {
    if (availableOutfits.length > 1) {
      setCurrentOutfitIndex((prev) => (prev + 1) % availableOutfits.length);
      setIsSaved(false);
      setIsWornLogged(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!activeOutfit || isSaved) return;
    try {
      const itemIds = activeOutfit.items.map(i => i.id);
      await api.saveOutfit({
        name: `${recommendationData?.constraints.occasion || 'Smart'} Combination`,
        occasion: recommendationData?.constraints.occasion || 'General',
        weather_summary: `${recommendationData?.weather.temperature}°C ${recommendationData?.weather.condition}`,
        why_explanation: activeOutfit.whyThisOutfit,
        score: activeOutfit.score,
        item_ids: itemIds
      });
      setIsSaved(true);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleWearToday = async () => {
    if (!activeOutfit || isWornLogged) return;
    try {
      const itemIds = activeOutfit.items.map(i => i.id);
      await api.wearOutfit({
        outfit_name: `${recommendationData?.constraints.occasion || 'Selected'} Outfit`,
        item_ids: itemIds,
        occasion: recommendationData?.constraints.occasion || 'Daily Wear',
        weather_desc: `${recommendationData?.weather.temperature}°C ${recommendationData?.weather.condition}`,
        rating: 5,
        notes: `Selected via AI recommendation: "${recommendationData?.query}"`
      });

      setIsWornLogged(true);

      // Trigger celebratory confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(`Logging wear error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Brand Differentiator Banner */}
      <HeroBanner />

      {/* Flagship Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          <span>Core AI Stylist Engine</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal-900">
          Personal Wardrobe Recommender
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Enter any occasion, weather query, or item preference in natural language. We synthesize an outfit using <strong>strictly clothes you already own</strong>.
        </p>
      </div>

      {/* 1. NATURAL LANGUAGE PROMPT INPUT BOX */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sand-200/90 shadow-sm space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleRecommend();
          }} 
          className="relative"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your styling request... e.g. 'I need something for a presentation tomorrow.'"
            className="w-full pl-5 pr-36 py-4 rounded-2xl bg-sand-50/80 border border-sand-300 text-charcoal-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-charcoal-900 text-white font-medium text-xs sm:text-sm hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2 shadow"
          >
            <Sparkles className="w-4 h-4 text-[#f4d06f]" />
            <span>{loading ? 'Styling...' : 'Get Outfit'}</span>
          </button>
        </form>

        {/* Suggestion Chips */}
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Try Example Constraints:
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setPrompt(s);
                  handleRecommend(s);
                }}
                className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 border border-sand-200 text-xs font-medium text-charcoal-700 transition-colors text-left"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">No Perfect Outfit Combination Found</h4>
              <p className="text-xs text-amber-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('add')}
            className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
          >
            + Add Clothes to Wardrobe
          </button>
        </div>
      )}

      {/* 2. LIVE OUTFIT RECOMMENDATION CANVAS */}
      {recommendationData && activeOutfit && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Weather Context Bar */}
          <div className="bg-sand-100/90 rounded-2xl p-4 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                {recommendationData.weather.isRainy ? (
                  <CloudRain className="w-5 h-5 text-blue-500" />
                ) : recommendationData.weather.isCold ? (
                  <Snowflake className="w-5 h-5 text-sky-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal-900">
                  {recommendationData.constraints.targetDate === 'tomorrow' ? 'Weather Tomorrow' : 'Current Weather'}:{' '}
                  <span className="font-serif text-sm font-semibold">{recommendationData.weather.temperature}°C, {recommendationData.weather.condition}</span>
                </span>
                <p className="text-[11px] text-gray-500">
                  {recommendationData.weather.advice}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-charcoal-800 border border-sand-200">
                Occasion: {recommendationData.constraints.occasion}
              </span>
              {availableOutfits.length > 1 && (
                <span className="text-xs text-gray-400 font-medium">
                  Look {currentOutfitIndex + 1} of {availableOutfits.length}
                </span>
              )}
            </div>
          </div>

          {/* MAIN RECOMMENDATION CARD */}
          <div className="bg-white rounded-3xl border border-sand-200 shadow-lg overflow-hidden">
            
            {/* Header with Title and Score */}
            <div className="p-6 border-b border-sand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sand-50/50">
              <div>
                <div className="text-[11px] font-bold text-terracotta uppercase tracking-wider mb-1">
                  Autonomous Coordination
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                  Recommended Outfit
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium">Styling Harmony</div>
                  <div className="font-serif text-lg font-bold text-emerald-700">
                    {activeOutfit.score}% Match
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Pieces Horizontal Equation (+ Layout) */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
                {activeOutfit.items.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {/* Item Card Box */}
                    <div 
                      onClick={() => onSelectItem(item)}
                      className="group bg-sand-50/80 rounded-2xl border border-sand-200 p-4 flex flex-col items-center text-center cursor-pointer hover:border-charcoal-900 transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white p-3 mb-3 border border-sand-100 flex items-center justify-center">
                        <img
                          src={item.image_url.startsWith('/uploads') ? `http://localhost:5000${item.image_url}` : item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-charcoal-900/80 text-white backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs sm:text-sm text-charcoal-900 line-clamp-1 mb-1">
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span>{item.color}</span>
                        <span>•</span>
                        <span>Level {item.formality}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* "WHY THIS OUTFIT?" SECTION */}
            <div className="bg-sand-50/80 border-t border-sand-200 p-6 sm:p-8 space-y-4">
              <h4 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Why this outfit?</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeOutfit.whyThisOutfit.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS BAR */}
            <div className="p-6 border-t border-sand-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              
              <div className="flex items-center gap-2">
                {/* Try Another button */}
                <button
                  onClick={handleNextOutfit}
                  className="px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-800 hover:bg-sand-100 text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-terracotta" />
                  <span>Try Another Combination</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Save Outfit button */}
                <button
                  onClick={handleSaveOutfit}
                  disabled={isSaved}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                    isSaved
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'border-sand-300 text-charcoal-800 hover:bg-sand-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isSaved ? 'Saved to Favorites' : 'Save Outfit'}</span>
                </button>

                {/* Wear This Today button */}
                <button
                  onClick={handleWearToday}
                  disabled={isWornLogged}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-md ${
                    isWornLogged
                      ? 'bg-emerald-600 text-white'
                      : 'bg-charcoal-900 text-white hover:bg-black'
                  }`}
                >
                  <Check className="w-4 h-4 text-sand-200" />
                  <span>{isWornLogged ? 'Worn Today Logged!' : 'Wear This Today'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* 3. MULTI-DAY TRIP OUTLOOK (If user requested multiple outfits) */}
          {recommendationData.additionalOutfits && recommendationData.additionalOutfits.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-terracotta" />
                <span>Multi-Day Itinerary Combinations</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendationData.additionalOutfits.map((extra, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-sand-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-charcoal-800">
                      <span>Day {idx + 2} Itinerary Look</span>
                      <span className="text-emerald-700">{extra.score}% Match</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto py-2">
                      {extra.items.map(i => (
                        <div key={i.id} className="w-16 h-16 rounded-xl bg-sand-50 border border-sand-200 p-1 shrink-0 flex items-center justify-center" title={i.name}>
                          <img src={i.image_url.startsWith('/uploads') ? `http://localhost:5000${i.image_url}` : i.image_url} alt={i.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {extra.whyThisOutfit[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
