import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RotateCcw, 
  Info,
  CheckCircle2,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Category, Color, Pattern, Style, Season, ClothingItem } from '../types';
import { api } from '../services/api';

interface AddClothingPageProps {
  onItemAdded: (item: ClothingItem) => void;
  onNavigate: (tab: string) => void;
}

const CATEGORIES: Category[] = [
  'Shirt', 'T-shirt', 'Trousers', 'Jeans', 'Dress', 'Skirt', 'Jacket', 'Blazer', 'Shoes', 'Accessories', 'Other'
];

const COLORS: Color[] = [
  'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Brown', 'Beige', 'Grey', 'Other'
];

const PATTERNS: Pattern[] = [
  'Solid', 'Striped', 'Checked', 'Printed', 'Floral', 'Other'
];

const STYLES: Style[] = [
  'Formal', 'Casual', 'Semi-formal', 'Sporty', 'Traditional'
];

const SEASONS: Season[] = [
  'Summer', 'Winter', 'Monsoon', 'All season'
];

export const AddClothingPage: React.FC<AddClothingPageProps> = ({
  onItemAdded,
  onNavigate
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Shirt');
  const [color, setColor] = useState<Color>('Blue');
  const [pattern, setPattern] = useState<Pattern>('Solid');
  const [style, setStyle] = useState<Style>('Casual');
  const [season, setSeason] = useState<Season>('All season');
  const [formality, setFormality] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setImagePreview(url);
    setIsSuccess(false);

    // Default name from filename
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !imagePreview) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      } else {
        formData.append('imageUrl', imagePreview);
      }

      const res = await api.analyzeClothingImage(formData);
      if (res && res.analysis) {
        const a = res.analysis;
        setAnalysisResult(a);
        if (a.category) setCategory(a.category as Category);
        if (a.color) setColor(a.color as Color);
        if (a.pattern) setPattern(a.pattern as Pattern);
        if (a.style) setStyle(a.style as Style);
        if (a.season) setSeason(a.season as Season);
        if (a.formality) setFormality(a.formality);

        // Enhance name if generic
        if (!name || name.toLowerCase().includes('image') || name.toLowerCase().includes('clothing')) {
          setName(`${a.color} ${a.pattern !== 'Solid' ? a.pattern + ' ' : ''}${a.category}`);
        }
      }
    } catch (err: any) {
      alert(`AI Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter an item name');

    setSaving(true);
    try {
      // If we analyzed, use the image URL returned by the backend (e.g. /uploads/...)
      // Otherwise use the preview or a generated SVG representation
      let finalImageUrl = imagePreview;

      const created = await api.createItem({
        name: name.trim(),
        image_url: finalImageUrl || '/placeholder-clothing.svg',
        category,
        color,
        pattern,
        style,
        season,
        formality,
        notes: notes.trim()
      });

      onItemAdded(created);
      setIsSuccess(true);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview('');
    setAnalysisResult(null);
    setName('');
    setCategory('Shirt');
    setColor('Blue');
    setPattern('Solid');
    setStyle('Casual');
    setSeason('All season');
    setFormality(3);
    setNotes('');
    setIsSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5 text-terracotta" />
          <span>Digital Closet Importer</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Add Clothing Item
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload or drag-and-drop a photo of your clothing item. The AI Computer Vision model will automatically analyze and classify it into your wardrobe.
        </p>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-base">"{name}" added to your wardrobe!</h4>
              <p className="text-xs text-emerald-700">The recommendation engine can now include this piece in your custom outfits.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Add Another Item
            </button>
            <button
              onClick={() => onNavigate('wardrobe')}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 flex items-center gap-1"
            >
              <span>View Wardrobe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px] ${
              imagePreview 
                ? 'border-sand-300 bg-white' 
                : 'border-sand-300 hover:border-terracotta bg-sand-50/60 hover:bg-sand-100/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {imagePreview ? (
              <div className="space-y-4 w-full">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sand-50 border border-sand-200 p-2">
                  <img
                    src={imagePreview}
                    alt="Clothing preview"
                    className="w-full h-full object-contain"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <Sparkles className="w-8 h-8 text-amber-300 animate-spin mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI Vision Scanning...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Click or drag to replace image
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-sand-200 text-charcoal-800 flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6 text-terracotta" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-charcoal-900">
                    Upload Clothing Photo
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag and drop, or browse your files (PNG, JPG, WEBP)
                  </p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-sand-200 text-[11px] font-semibold text-charcoal-700">
                  Supports smartphone camera photos
                </div>
              </div>
            )}
          </div>

          {/* Analyze with AI Button */}
          {imagePreview && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3.5 rounded-2xl bg-charcoal-900 text-white font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-[#f4d06f]" />
              <span>{analyzing ? 'Analyzing with AI Vision...' : 'Analyze Clothing with AI'}</span>
            </button>
          )}

          {/* AI Analysis Diagnostic pill */}
          {analysisResult && (
            <div className="bg-sand-100 rounded-2xl p-4 border border-sand-200 text-xs text-charcoal-800 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                  <span>AI Detection Summary</span>
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white text-gray-700 border border-sand-200">
                  {analysisResult.serviceProvider}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Confidence rating: {(analysisResult.confidence * 100).toFixed(0)}%. You can refine or edit any detected metadata below before saving.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Editable Metadata Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 border-b border-sand-100 pb-3">
              Item Details & Classification
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. White Formal Oxford Shirt"
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                required
              />
            </div>

            {/* Category & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Dominant Color *
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value as Color)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                >
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Pattern & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Pattern
                </label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as Pattern)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                >
                  {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as Style)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                >
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Season & Formality Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Approximate Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as Season)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                >
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                    Formality Level (1-5)
                  </label>
                  <span className="font-bold text-xs text-charcoal-900 bg-sand-100 px-2 py-0.5 rounded">
                    Level {formality} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formality}
                  onChange={(e) => setFormality(parseInt(e.target.value, 10))}
                  className="w-full accent-charcoal-900 mt-2"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Casual (1)</span>
                  <span>Smart Casual (3)</span>
                  <span>Formal (5)</span>
                </div>
              </div>
            </div>

            {/* Styling Notes */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Notes & Fit Details
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Crisp cotton, slim fit, ideal for presentations or blazer pairing"
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900"
              />
            </div>

            {/* Form Buttons */}
            <div className="pt-4 border-t border-sand-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-sand-300 text-xs font-semibold text-charcoal-700 hover:bg-sand-100"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="px-6 py-2.5 rounded-xl bg-charcoal-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2 shadow"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving to Wardrobe...' : 'Save to Digital Wardrobe'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
