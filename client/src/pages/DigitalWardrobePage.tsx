import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Plus, 
  RotateCcw, 
  Layers, 
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { ClothingItem, Category, Color, Style, Season } from '../types';
import { ClothingCard } from '../components/ClothingCard';

interface DigitalWardrobePageProps {
  items: ClothingItem[];
  onSelectItem: (item: ClothingItem) => void;
  onMarkWorn: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onNavigate: (tab: string) => void;
}

const CATEGORY_TABS: (Category | 'All')[] = [
  'All', 'Shirt', 'T-shirt', 'Trousers', 'Jeans', 'Blazer', 'Jacket', 'Shoes', 'Accessories'
];

const COLORS: (Color | 'All')[] = [
  'All', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Brown', 'Beige', 'Grey'
];

const STYLES: (Style | 'All')[] = [
  'All', 'Formal', 'Semi-formal', 'Casual', 'Sporty'
];

const SEASONS: (Season | 'All')[] = [
  'All', 'All season', 'Summer', 'Winter', 'Monsoon'
];

export const DigitalWardrobePage: React.FC<DigitalWardrobePageProps> = ({
  items,
  onSelectItem,
  onMarkWorn,
  onDeleteItem,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'last_worn' | 'formality'>('recent');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // 2. Color filter
      if (selectedColor !== 'All' && item.color !== selectedColor) {
        return false;
      }
      // 3. Style filter
      if (selectedStyle !== 'All' && item.style !== selectedStyle) {
        return false;
      }
      // 4. Season filter
      if (selectedSeason !== 'All' && item.season !== selectedSeason) {
        return false;
      }
      // 5. Search query matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchColor = item.color.toLowerCase().includes(query);
        const matchStyle = item.style.toLowerCase().includes(query);
        const matchNotes = (item.notes || '').toLowerCase().includes(query);

        // Smart compound match: e.g. "blue shirts"
        if (query.includes('blue') && query.includes('shirt')) {
          if (item.color.toLowerCase() === 'blue' && (item.category === 'Shirt' || item.category === 'T-shirt')) return true;
        }
        if (query.includes('formal')) {
          if (item.style === 'Formal' || item.formality >= 4) return true;
        }
        if (query.includes('black') && query.includes('trouser')) {
          if (item.color.toLowerCase() === 'black' && item.category === 'Trousers') return true;
        }

        return matchName || matchCat || matchColor || matchStyle || matchNotes;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'last_worn') {
        const dateA = a.last_worn ? new Date(a.last_worn).getTime() : 0;
        const dateB = b.last_worn ? new Date(b.last_worn).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'formality') {
        return (b.formality || 0) - (a.formality || 0);
      }
      // default: recent by created_at or id
      return b.id.localeCompare(a.id);
    });
  }, [items, selectedCategory, selectedColor, selectedStyle, selectedSeason, searchTerm, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedColor('All');
    setSelectedStyle('All');
    setSelectedSeason('All');
    setSortBy('recent');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedColor !== 'All' || selectedStyle !== 'All' || selectedSeason !== 'All';

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-terracotta" />
            <span>Personal Inventory</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Digital Wardrobe
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search, and manage every item you own. {items.length} items cataloged.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('add')}
            className="px-5 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs sm:text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4 text-terracotta" />
            <span>Add Clothes</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Suggestions Bar */}
      <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your wardrobe... (e.g. 'blue shirts', 'formal clothes', 'black trousers')"
            className="w-full pl-11 pr-24 py-3 rounded-2xl bg-sand-50/70 border border-sand-200 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-charcoal-900"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-sand-100 text-charcoal-700 hover:bg-sand-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="pt-3 border-t border-sand-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-charcoal-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-terracotta" />
              <span>Filters:</span>
            </span>

            {/* Color */}
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-sand-200 bg-sand-50 text-charcoal-800"
            >
              <option value="All">All Colors</option>
              {COLORS.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Style */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-sand-200 bg-sand-50 text-charcoal-800"
            >
              <option value="All">All Styles</option>
              {STYLES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Season */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-sand-200 bg-sand-50 text-charcoal-800"
            >
              <option value="All">All Seasons</option>
              {SEASONS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-terracotta hover:underline ml-1 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-sand-200 bg-sand-50 text-charcoal-800 font-medium"
            >
              <option value="recent">Recently Added</option>
              <option value="last_worn">Last Worn</option>
              <option value="formality">Formality Level (High to Low)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Wardrobe Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onMarkWorn={onMarkWorn}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-sand-200/90 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto text-charcoal-500">
            <Search className="w-6 h-6 text-terracotta" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            No Matching Wardrobe Items
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            We couldn't find any items matching your active search or filters. Try resetting the filters or uploading a new item.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-sand-100 text-charcoal-800 text-xs font-semibold hover:bg-sand-200"
            >
              Clear Filters
            </button>
            <button
              onClick={() => onNavigate('add')}
              className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black"
            >
              + Add Clothes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
