import React, { useState } from 'react';
import { 
  Sparkles, 
  Shirt, 
  Layers, 
  Footprints, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Clock, 
  Star,
  CheckCircle,
  Bookmark
} from 'lucide-react';
import { ClothingItem, DashboardStats, WearHistoryItem, WeatherInfo } from '../types';
import { WeatherWidget } from '../components/WeatherWidget';
import { ClothingCard } from '../components/ClothingCard';

interface DashboardPageProps {
  stats: DashboardStats;
  recentItems: ClothingItem[];
  recentWorn: WearHistoryItem[];
  weather: WeatherInfo | null;
  onCityChange: (city: string) => void;
  onPresetChange: (presetKey: string) => void;
  currentCity?: string;
  activePreset?: string;
  onRunPrompt: (prompt: string) => void;
  onNavigate: (tab: string) => void;
  onSelectItem: (item: ClothingItem) => void;
  onMarkItemWorn: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentItems,
  recentWorn,
  weather,
  onCityChange,
  onPresetChange,
  currentCity,
  activePreset,
  onRunPrompt,
  onNavigate,
  onSelectItem,
  onMarkItemWorn
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const quickPrompts = [
    'I have a presentation tomorrow',
    'I need an outfit for college',
    'What should I wear on a rainy day?',
    'Create a casual weekend outfit',
    'Use my blue shirt',
    'Don\'t use jeans'
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onRunPrompt(customPrompt.trim());
  };

  const statCards = [
    { label: 'Total Items', count: stats.totalItems, icon: Layers, color: 'bg-sand-100 text-charcoal-900' },
    { label: 'Tops', count: stats.tops, icon: Shirt, color: 'bg-blue-50 text-blue-800' },
    { label: 'Bottoms', count: stats.bottoms, icon: Layers, color: 'bg-emerald-50 text-emerald-800' },
    { label: 'Outerwear', count: stats.outerwear, icon: ShieldCheck, color: 'bg-amber-50 text-amber-800' },
    { label: 'Footwear', count: stats.shoes, icon: Footprints, color: 'bg-purple-50 text-purple-800' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. PROMINENT AI PROMPT BOX */}
      <section className="bg-charcoal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle accent blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sand-200">
            <Sparkles className="w-4 h-4 text-terracotta animate-pulse" />
            <span>AI Wardrobe Stylist</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            What are you wearing today?
          </h2>

          <p className="text-xs sm:text-sm text-gray-300">
            Describe your event, dress code, or mood. We'll search only through your owned clothes.
          </p>

          <form onSubmit={handlePromptSubmit} className="relative mt-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. I need something for a presentation tomorrow..."
              className="w-full pl-5 pr-28 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-terracotta focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              disabled={!customPrompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-terracotta text-white font-medium text-xs sm:text-sm hover:bg-terracotta-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow"
            >
              <span>Style Me</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick suggestions pills */}
          <div className="pt-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">
              Popular Prompts:
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onRunPrompt(p)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-sand-100 transition-all text-left"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS ROW + WEATHER WIDGET */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wardrobe Breakdown Stats (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              Wardrobe Inventory
            </h3>
            <button
              onClick={() => onNavigate('wardrobe')}
              className="text-xs font-semibold text-terracotta hover:underline flex items-center gap-1"
            >
              <span>View All Items ({stats.totalItems})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-4 border border-sand-200/90 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-charcoal-900">
                    {stat.count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action: Add clothing callout */}
          <div className="bg-sand-100/70 rounded-2xl p-4 border border-sand-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-white flex items-center justify-center">
                <Plus className="w-5 h-5 text-sand-200" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-charcoal-900">Upload or Photograph Clothes</h4>
                <p className="text-xs text-gray-500">AI automatically detects category, color, season, and formality.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('add')}
              className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-medium hover:bg-black transition-colors"
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Live Weather Widget (1 col) */}
        <div>
          <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-4">
            Climate & Styling Forecast
          </h3>
          <WeatherWidget
            weather={weather}
            onCityChange={onCityChange}
            onPresetChange={onPresetChange}
            currentCity={currentCity}
            activePreset={activePreset}
          />
        </div>

      </section>

      {/* 3. RECENTLY ADDED ITEMS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Recently Added to Closet
            </h3>
            <p className="text-xs text-gray-500">Latest additions available for recommendation</p>
          </div>
          <button
            onClick={() => onNavigate('wardrobe')}
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Manage Digital Wardrobe →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {recentItems.slice(0, 5).map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onMarkWorn={onMarkItemWorn}
            />
          ))}
        </div>
      </section>

      {/* 4. RECENTLY WORN OUTFITS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Recently Worn Outfits
            </h3>
            <p className="text-xs text-gray-500">
              Logged looks helping the engine avoid repeating recent combinations
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Full Wear History ({recentWorn.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentWorn.slice(0, 2).map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-5 border border-sand-200/90 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1 font-medium text-charcoal-700">
                    <Clock className="w-3.5 h-3.5 text-sand-800" />
                    {log.worn_date}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(log.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <h4 className="font-serif font-bold text-base text-charcoal-900 mb-1">
                  {log.outfit_name}
                </h4>

                <p className="text-xs text-gray-500 mb-2">
                  Occasion: <strong className="text-charcoal-700">{log.occasion}</strong> • {log.weather_desc}
                </p>

                <p className="text-xs text-charcoal-800 bg-sand-50 p-2.5 rounded-xl border border-sand-200">
                  {log.items_summary}
                </p>
              </div>

              {log.notes && (
                <div className="mt-3 pt-2 border-t border-sand-100 text-[11px] text-gray-500 italic">
                  "{log.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
