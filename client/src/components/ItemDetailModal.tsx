import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  Star,
  CheckCircle,
  Tag
} from 'lucide-react';
import { ClothingItem, Category, Color, Pattern, Style, Season } from '../types';

interface ItemDetailModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<ClothingItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkWorn: (id: string) => Promise<void>;
}

const CATEGORIES: Category[] = ['Shirt', 'T-shirt', 'Trousers', 'Jeans', 'Dress', 'Skirt', 'Jacket', 'Blazer', 'Shoes', 'Accessories', 'Other'];
const COLORS: Color[] = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Brown', 'Beige', 'Grey', 'Other'];
const PATTERNS: Pattern[] = ['Solid', 'Striped', 'Checked', 'Printed', 'Floral', 'Other'];
const STYLES: Style[] = ['Formal', 'Casual', 'Semi-formal', 'Sporty', 'Traditional'];
const SEASONS: Season[] = ['Summer', 'Winter', 'Monsoon', 'All season'];

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onMarkWorn
}) => {
  if (!isOpen || !item) return null;

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<Category>(item.category);
  const [color, setColor] = useState<Color>(item.color);
  const [pattern, setPattern] = useState<Pattern>(item.pattern);
  const [style, setStyle] = useState<Style>(item.style);
  const [season, setSeason] = useState<Season>(item.season);
  const [formality, setFormality] = useState<number>(item.formality || 3);
  const [notes, setNotes] = useState(item.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(item.name);
    setCategory(item.category);
    setColor(item.color);
    setPattern(item.pattern);
    setStyle(item.style);
    setSeason(item.season);
    setFormality(item.formality || 3);
    setNotes(item.notes || '');
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name,
        category,
        color,
        pattern,
        style,
        season,
        formality,
        notes
      });
      onClose();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-sand-200 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-terracotta" />
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Wardrobe Item Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-charcoal-900 hover:bg-sand-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Visual Column */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-full aspect-square bg-sand-50 rounded-2xl border border-sand-200 p-4 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={item.image_url.startsWith('/uploads') ? `http://localhost:5000${item.image_url}` : item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Quick actions under image */}
              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => onMarkWorn(item.id)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-sand-100 text-charcoal-800 hover:bg-sand-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Worn Today</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to remove "${item.name}" from your wardrobe?`)) {
                      await onDelete(item.id);
                      onClose();
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete from Wardrobe</span>
                </button>
              </div>
            </div>

            {/* Form Fields Column */}
            <div className="md:col-span-2 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value as Color)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  >
                    {COLORS.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Pattern
                  </label>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value as Pattern)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  >
                    {PATTERNS.map(pat => <option key={pat} value={pat}>{pat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Style Tone
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as Style)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as Season)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  >
                    {SEASONS.map(sea => <option key={sea} value={sea}>{sea}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Formality (1 to 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formality}
                      onChange={(e) => setFormality(parseInt(e.target.value, 10))}
                      className="w-full accent-charcoal-900"
                    />
                    <span className="font-bold text-sm text-charcoal-900 min-w-5 text-right">{formality}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Styling Notes / Fabric / Fit
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  placeholder="e.g. Crisp cotton oxford, fits slim, great with dark denim"
                />
              </div>

            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-sand-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-sand-300 text-sm font-medium text-charcoal-700 hover:bg-sand-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
