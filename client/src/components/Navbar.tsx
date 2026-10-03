import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Compass, 
  Bookmark, 
  History, 
  PlusCircle, 
  RotateCcw, 
  Menu, 
  X, 
  CloudSun,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetDemo: () => void;
  isAiMock?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  isAiMock = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Explore', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'wardrobe', label: 'My Wardrobe', icon: Layers },
    { id: 'recommender', label: 'AI Stylist', icon: Sparkles, highlight: true },
    { id: 'saved', label: 'Saved Looks', icon: Bookmark },
    { id: 'history', label: 'Wear Log', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#f4d06f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-charcoal-900">WardrobeAI</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sand-200 text-sand-800">
                  Private Closet
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">Zero Shopping • Pure Personal Styling</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-charcoal-900 text-white shadow-sm'
                      : item.highlight
                      ? 'text-terracotta hover:bg-terracotta/10'
                      : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-sand-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-terracotta' : 'text-gray-400'}`} />
                  {item.label}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Add clothes button */}
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'add'
                  ? 'bg-terracotta text-white shadow'
                  : 'bg-sand-200/80 text-charcoal-900 hover:bg-sand-300'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-terracotta" />
              <span>Add Clothes</span>
            </button>

            {/* Reset Demo button */}
            <button
              onClick={onResetDemo}
              title="Reset wardrobe to default curated demo collection"
              className="p-2 text-gray-400 hover:text-charcoal-900 hover:bg-sand-200/60 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setActiveTab('add')}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-terracotta text-white"
            >
              + Add
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-700 hover:bg-sand-200 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-[#faf8f5] px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-charcoal-900 text-white' : 'text-charcoal-700 hover:bg-sand-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-sand-200 flex justify-between items-center">
            <button
              onClick={() => {
                setActiveTab('add');
                setMobileMenuOpen(false);
              }}
              className="w-full mr-2 py-2 text-center rounded-lg bg-terracotta text-white text-sm font-medium"
            >
              Add New Clothing
            </button>
            <button
              onClick={() => {
                onResetDemo();
                setMobileMenuOpen(false);
              }}
              className="p-2 border border-sand-300 rounded-lg text-xs text-charcoal-700"
              title="Reset Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
