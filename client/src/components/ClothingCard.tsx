import React from 'react';
import { 
  Check, 
  Trash2, 
  Clock, 
  Sparkles, 
  Star,
  ExternalLink
} from 'lucide-react';
import { ClothingItem } from '../types';

interface ClothingCardProps {
  item: ClothingItem;
  onSelect?: (item: ClothingItem) => void;
  onMarkWorn?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onSelect,
  onMarkWorn,
  onDelete
}) => {
  // Format last worn
  const formatLastWorn = (dateStr?: string | null) => {
    if (!dateStr) return 'Never logged';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Worn today';
    if (diffDays === 1) return 'Worn yesterday';
    if (diffDays < 7) return `Worn ${diffDays}d ago`;
    return `Worn ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  const getFormalityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Casual (1)';
      case 2: return 'Relaxed (2)';
      case 3: return 'Smart Casual (3)';
      case 4: return 'Semi-Formal (4)';
      case 5: return 'Formal (5)';
      default: return `Level ${level}`;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-sand-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Visual Image Container */}
      <div 
        onClick={() => onSelect && onSelect(item)}
        className="relative aspect-square w-full bg-sand-50 overflow-hidden cursor-pointer flex items-center justify-center p-4"
      >
        <img
          src={item.image_url.startsWith('/uploads') ? `http://localhost:5000${item.image_url}` : item.image_url}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-charcoal-900/80 backdrop-blur-sm text-white">
            {item.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/90 backdrop-blur-sm text-charcoal-800 border border-sand-200">
            {item.color}
          </span>
        </div>

        {/* Formality badge */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sand-100/90 backdrop-blur-sm text-charcoal-700 border border-sand-200 flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
            {item.formality}/5
          </span>
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-charcoal-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-charcoal-900/90 text-white flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Details
          </span>
        </div>
      </div>

      {/* Info & Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 
              onClick={() => onSelect && onSelect(item)}
              className="font-medium text-sm text-charcoal-900 line-clamp-1 hover:text-terracotta cursor-pointer transition-colors"
              title={item.name}
            >
              {item.name}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
            <span>{item.style}</span>
            <span>•</span>
            <span>{item.pattern}</span>
            <span>•</span>
            <span>{item.season}</span>
          </div>

          {item.notes && (
            <p className="text-xs text-charcoal-600 line-clamp-2 italic mb-2">
              "{item.notes}"
            </p>
          )}
        </div>

        {/* Card Footer: Last Worn & Quick Actions */}
        <div className="pt-2 border-t border-sand-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastWorn(item.last_worn)}</span>
          </div>

          <div className="flex items-center gap-1">
            {onMarkWorn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkWorn(item.id);
                }}
                title="Mark as worn today"
                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove "${item.name}" from your wardrobe?`)) {
                    onDelete(item.id);
                  }
                }}
                title="Delete item"
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
