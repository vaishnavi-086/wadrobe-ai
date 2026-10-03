/**
 * Weather Service for WardrobeAI
 * 
 * Modular weather provider using:
 * 1. Open-Meteo API (Free, high-accuracy, zero API-key needed)
 * 2. Realistic Weather Simulator / Preset override
 * 3. Offline robust fallback
 */

const PRESET_CITIES = {
  'New York': { lat: 40.7128, lon: -74.0060 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Sydney': { lat: -33.8688, lon: 151.2093 }
};

const WEATHER_PRESETS = {
  'rainy': {
    condition: 'Rain expected',
    temperature: 20,
    tempMin: 18,
    tempMax: 22,
    precipitationProb: 85,
    icon: 'rain',
    isRainy: true,
    isCold: false,
    isHot: false,
    advice: 'High chance of rain. Prioritize water-resistant layers and avoid delicate white footwear or suede.'
  },
  'hot': {
    condition: 'Hot & Sunny',
    temperature: 31,
    tempMin: 26,
    tempMax: 33,
    precipitationProb: 10,
    icon: 'sun',
    isRainy: false,
    isCold: false,
    isHot: true,
    advice: 'High heat forecast. Recommend breathable lightweight fabrics (cotton/linen) and short sleeves.'
  },
  'cold': {
    condition: 'Cold & Breezy',
    temperature: 11,
    tempMin: 8,
    tempMax: 13,
    precipitationProb: 20,
    icon: 'cold',
    isRainy: false,
    isCold: true,
    isHot: false,
    advice: 'Chilly temperature. Outerwear (blazer, coat, or wool knit sweater) recommended.'
  },
  'mild': {
    condition: 'Clear & Pleasant',
    temperature: 24,
    tempMin: 20,
    tempMax: 25,
    precipitationProb: 15,
    icon: 'partly-cloudy',
    isRainy: false,
    isCold: false,
    isHot: false,
    advice: 'Optimal mild climate. Highly flexible for single-layer shirts or light blazers.'
  }
};

class WeatherService {
  constructor() {
    this.currentSimulationMode = null; // can be 'rainy', 'hot', 'cold', 'mild'
    this.currentCity = 'New York';
  }

  setCity(cityName) {
    if (PRESET_CITIES[cityName]) {
      this.currentCity = cityName;
    }
  }

  setSimulationPreset(presetKey) {
    if (WEATHER_PRESETS[presetKey]) {
      this.currentSimulationMode = presetKey;
    } else {
      this.currentSimulationMode = null; // reset to real/auto
    }
  }

  async getWeather(targetDate = 'today', city = this.currentCity) {
    // If a manual simulation preset is active, return preset immediately
    if (this.currentSimulationMode && WEATHER_PRESETS[this.currentSimulationMode]) {
      const preset = WEATHER_PRESETS[this.currentSimulationMode];
      return {
        city: city || this.currentCity,
        targetDate,
        isSimulated: true,
        simulationPreset: this.currentSimulationMode,
        ...preset
      };
    }

    const cityCoords = PRESET_CITIES[city] || PRESET_CITIES['New York'];

    try {
      // Free Open-Meteo API query
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityCoords.lat}&longitude=${cityCoords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&current_weather=true&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Weather API status: ${res.status}`);

      const data = await res.json();
      const isTomorrow = targetDate.toLowerCase().includes('tomorrow');
      const dayIndex = isTomorrow ? 1 : 0;

      const tempMax = Math.round(data.daily?.temperature_2m_max?.[dayIndex] ?? 24);
      const tempMin = Math.round(data.daily?.temperature_2m_min?.[dayIndex] ?? 18);
      const currentTemp = Math.round(data.current_weather?.temperature ?? (tempMax + tempMin) / 2);
      const precipProb = Math.round(data.daily?.precipitation_probability_max?.[dayIndex] ?? 20);
      const weatherCode = data.daily?.weathercode?.[dayIndex] ?? 1;

      const isRainy = precipProb > 45 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
      const isCold = tempMax < 16;
      const isHot = tempMax > 28;

      let condition = 'Clear & Mild';
      let icon = 'sun';
      if (isRainy) {
        condition = 'Rain expected';
        icon = 'rain';
      } else if (isCold) {
        condition = 'Cold & Overcast';
        icon = 'cold';
      } else if (isHot) {
        condition = 'Warm & Sunny';
        icon = 'sun';
      } else if (weatherCode > 2) {
        condition = 'Partly Cloudy';
        icon = 'partly-cloudy';
      }

      let advice = 'Pleasant weather for standard wardrobe combinations.';
      if (isRainy) advice = 'Rain expected. Avoid delicate footwear and consider water-resistant layers.';
      else if (isHot) advice = 'Warm day. Prefer breathable short sleeves or light cottons.';
      else if (isCold) advice = 'Low temperatures. Layering with a jacket, sweater, or blazer is recommended.';

      return {
        city,
        targetDate: isTomorrow ? 'tomorrow' : 'today',
        condition,
        temperature: isTomorrow ? tempMax : currentTemp,
        tempMin,
        tempMax,
        precipitationProb: precipProb,
        icon,
        isRainy,
        isCold,
        isHot,
        advice,
        isSimulated: false,
        source: 'Open-Meteo Live API'
      };
    } catch (err) {
      console.warn('Weather API failed or timed out, returning realistic mock weather:', err.message);
      // Realistic fallback
      const fallback = WEATHER_PRESETS['mild'];
      return {
        city,
        targetDate,
        ...fallback,
        isSimulated: true,
        source: 'WardrobeAI Adaptive Weather Engine (Fallback)'
      };
    }
  }

  getPresetList() {
    return Object.keys(WEATHER_PRESETS).map(key => ({
      key,
      name: WEATHER_PRESETS[key].condition,
      temperature: WEATHER_PRESETS[key].temperature,
      precipitationProb: WEATHER_PRESETS[key].precipitationProb
    }));
  }

  getAvailableCities() {
    return Object.keys(PRESET_CITIES);
  }
}

module.exports = new WeatherService();
