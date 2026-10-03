import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalWardrobePage } from './pages/DigitalWardrobePage';
import { AddClothingPage } from './pages/AddClothingPage';
import { RecommenderPage } from './pages/RecommenderPage';
import { SavedOutfitsPage } from './pages/SavedOutfitsPage';
import { OutfitHistoryPage } from './pages/OutfitHistoryPage';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ClothingItem, DashboardStats, WearHistoryItem, WeatherInfo } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    tops: 0,
    bottoms: 0,
    shoes: 0,
    outerwear: 0,
    savedOutfits: 0
  });
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [recentWorn, setRecentWorn] = useState<WearHistoryItem[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [currentCity, setCurrentCity] = useState<string>('New York');
  const [activePreset, setActivePreset] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<any>({ isMock: true, provider: 'Heuristic Vision' });
  const [loading, setLoading] = useState<boolean>(true);

  // Load essential application data
  const refreshData = async () => {
    try {
      const [dashData, itemsData, weatherData, aiStat] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getItems().catch(() => []),
        api.getWeather('today', currentCity).catch(() => null),
        api.getAiStatus().catch(() => null)
      ]);

      if (dashData && dashData.stats) {
        setStats(dashData.stats);
        setRecentItems(dashData.recentItems || []);
        setRecentWorn(dashData.recentWorn || []);
      }

      if (itemsData) setItems(itemsData);
      if (weatherData && weatherData.weather) setWeather(weatherData.weather);
      if (aiStat) setAiStatus(aiStat);
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentCity]);

  // Handle weather changes
  const handleCityChange = async (city: string) => {
    setCurrentCity(city);
    try {
      const res = await api.getWeather('today', city);
      if (res && res.weather) setWeather(res.weather);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePresetChange = async (presetKey: string) => {
    setActivePreset(presetKey);
    try {
      await api.setWeatherPreset(presetKey);
      const res = await api.getWeather('today', currentCity);
      if (res && res.weather) setWeather(res.weather);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick prompt runner from Landing or Dashboard
  const handleRunPrompt = (promptText: string) => {
    setActivePrompt(promptText);
    setActiveTab('recommender');
  };

  // Reset demo wardrobe
  const handleResetDemo = async () => {
    if (confirm('Reset wardrobe to original 12 curated demo items with sample wear history?')) {
      try {
        await api.resetDemoWardrobe();
        await refreshData();
        alert('Wardrobe successfully reset to initial demo collection!');
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      }
    }
  };

  // Item modifications
  const handleSaveItemEdit = async (updated: Partial<ClothingItem>) => {
    if (!selectedItem) return;
    const res = await api.updateItem(selectedItem.id, updated);
    setSelectedItem(null);
    await refreshData();
  };

  const handleDeleteItem = async (id: string) => {
    await api.deleteItem(id);
    if (selectedItem?.id === id) setSelectedItem(null);
    await refreshData();
  };

  const handleMarkItemWorn = async (id: string) => {
    await api.markItemWorn(id);
    await refreshData();
  };

  const handleItemAdded = async (newItem: ClothingItem) => {
    await refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-charcoal-900">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        isAiMock={aiStatus?.isMock}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={setActiveTab}
            onRunSamplePrompt={handleRunPrompt}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            recentItems={recentItems}
            recentWorn={recentWorn}
            weather={weather}
            onCityChange={handleCityChange}
            onPresetChange={handlePresetChange}
            currentCity={currentCity}
            activePreset={activePreset}
            onRunPrompt={handleRunPrompt}
            onNavigate={setActiveTab}
            onSelectItem={setSelectedItem}
            onMarkItemWorn={handleMarkItemWorn}
          />
        )}

        {activeTab === 'wardrobe' && (
          <DigitalWardrobePage
            items={items}
            onSelectItem={setSelectedItem}
            onMarkWorn={handleMarkItemWorn}
            onDeleteItem={handleDeleteItem}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'add' && (
          <AddClothingPage
            onItemAdded={handleItemAdded}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'recommender' && (
          <RecommenderPage
            initialPrompt={activePrompt}
            weather={weather}
            currentCity={currentCity}
            onNavigate={setActiveTab}
            onSelectItem={setSelectedItem}
          />
        )}

        {activeTab === 'saved' && (
          <SavedOutfitsPage
            onSelectItem={setSelectedItem}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <OutfitHistoryPage
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Item Detail / Edit Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onSave={handleSaveItemEdit}
        onDelete={handleDeleteItem}
        onMarkWorn={handleMarkItemWorn}
      />

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-sand-100/50 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-charcoal-900 text-sm">WardrobeAI</span>
            <span>—</span>
            <span>Your Wardrobe. Smarter.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-charcoal-700 font-medium">100% Owned Clothes Stylist</span>
            <span>•</span>
            <span>Zero Shopping Ads</span>
            <span>•</span>
            <span>Modular Weather & Vision Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
