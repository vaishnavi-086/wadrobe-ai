import React, { useState } from 'react';
import { 
  CloudRain, 
  Sun, 
  Snowflake, 
  CloudSun, 
  MapPin, 
  SlidersHorizontal,
  Droplets,
  Wind
} from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherWidgetProps {
  weather: WeatherInfo | null;
  onCityChange: (city: string) => void;
  onPresetChange: (presetKey: string) => void;
  currentCity?: string;
  activePreset?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  onCityChange,
  onPresetChange,
  currentCity = 'New York',
  activePreset
}) => {
  const [showControls, setShowControls] = useState(false);

  const cities = ['New York', 'London', 'Mumbai', 'San Francisco', 'Tokyo', 'Paris'];
  const presets = [
    { key: 'mild', label: 'Mild (24°C)', icon: CloudSun },
    { key: 'rainy', label: 'Rainy (20°C)', icon: CloudRain },
    { key: 'hot', label: 'Hot (31°C)', icon: Sun },
    { key: 'cold', label: 'Cold (11°C)', icon: Snowflake },
  ];

  if (!weather) {
    return (
      <div className="bg-sand-100 rounded-2xl p-4 animate-pulse flex items-center justify-between">
        <div className="h-5 w-32 bg-sand-200 rounded" />
        <div className="h-6 w-12 bg-sand-200 rounded" />
      </div>
    );
  }

  const renderIcon = () => {
    if (weather.isRainy) return <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />;
    if (weather.isCold) return <Snowflake className="w-8 h-8 text-sky-400" />;
    if (weather.isHot) return <Sun className="w-8 h-8 text-amber-500" />;
    return <CloudSun className="w-8 h-8 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center">
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-900">{weather.city}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sand-100 text-charcoal-600">
                {weather.targetDate === 'tomorrow' ? 'Tomorrow' : 'Today'}
              </span>
              {weather.isSimulated && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Simulation
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium capitalize mt-0.5">
              {weather.condition} • High {weather.tempMax}°C / Low {weather.tempMin}°C
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-2xl font-serif font-bold text-charcoal-900">
              {weather.temperature}°C
            </div>
            <div className="flex items-center gap-1 text-[11px] text-blue-600 justify-end font-medium">
              <Droplets className="w-3 h-3" />
              <span>{weather.precipitationProb}% rain</span>
            </div>
          </div>

          <button
            onClick={() => setShowControls(!showControls)}
            title="Configure weather simulation or city"
            className={`p-2 rounded-xl border transition-colors ${
              showControls ? 'bg-charcoal-900 text-white border-charcoal-900' : 'bg-sand-50 text-charcoal-700 border-sand-200 hover:bg-sand-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weather Advice banner */}
      <div className="mt-3.5 pt-3 border-t border-sand-100 flex items-center gap-2 text-xs text-charcoal-700">
        <span className="font-semibold text-terracotta shrink-0">Styling Impact:</span>
        <span className="truncate">{weather.advice}</span>
      </div>

      {/* Expandable Controls: City switcher & Simulation Presets */}
      {showControls && (
        <div className="mt-4 pt-3 border-t border-sand-200/80 space-y-3 animate-fade-in">
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-charcoal-800 mb-2">
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span>Select Location (Live Open-Meteo API)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => onCityChange(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    currentCity === city
                      ? 'bg-charcoal-900 text-white'
                      : 'bg-sand-100 text-charcoal-700 hover:bg-sand-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800 mb-2">
              <span>Test Adaptive Weather Presets</span>
              {activePreset && (
                <button
                  onClick={() => onPresetChange('')}
                  className="text-[11px] text-terracotta hover:underline font-normal"
                >
                  Reset to Live Weather
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activePreset === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => onPresetChange(isSelected ? '' : preset.key)}
                    className={`flex items-center gap-1.5 justify-center px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-terracotta text-white border-terracotta shadow-sm'
                        : 'bg-sand-50 text-charcoal-800 border-sand-200 hover:bg-sand-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
