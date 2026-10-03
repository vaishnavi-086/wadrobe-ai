import React from 'react';
import { 
  Sparkles, 
  Camera, 
  Cpu, 
  CloudRain, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  ShoppingBag,
  Sliders,
  Layers
} from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onRunSamplePrompt: (prompt: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onRunSamplePrompt
}) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10">
        <HeroBanner />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Digital Wardrobe & Autonomous Stylist</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.15]">
            Your Wardrobe. <br />
            <span className="italic font-normal text-terracotta">Smarter.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Photograph your clothes once. Get personalized outfits using <strong>only what you already own</strong>. No endless shopping feeds, no external product ads — just your curated closet unlocked.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('add')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-charcoal-900 text-white font-medium hover:bg-black shadow-lg shadow-charcoal-900/10 flex items-center justify-center gap-2 transition-all group"
            >
              <span>Build My Wardrobe</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('recommender')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-sand-300 text-charcoal-900 font-medium hover:bg-sand-100 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Try Demo Recommender</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            How WardrobeAI Works
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Three simple steps to effortless morning styling without buying anything new.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-sm relative overflow-hidden group hover:border-sand-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center text-charcoal-900 mb-5 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-terracotta" />
            </div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 01</div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">Snap Your Clothes Once</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Upload photos of your tops, bottoms, shoes, and outerwear. Take a picture right from your phone or drag and drop.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-sm relative overflow-hidden group hover:border-sand-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center text-charcoal-900 mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6 text-sage" />
            </div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 02</div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">AI Analyzes & Categorizes</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Computer vision automatically tags category, dominant color, pattern, style, seasonality, and formality level (1-5).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-sm relative overflow-hidden group hover:border-sand-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center text-charcoal-900 mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-[#d97706]" />
            </div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 03</div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">Ask Naturally Every Day</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Type "I have a presentation tomorrow" or "What should I wear if it rains?" and get coordinated combinations tailored to your weather.
            </p>
          </div>

        </div>
      </section>

      {/* 3. CORE PILLARS & FEATURES GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Feature 1: Weather-Aware Suggestions */}
          <div className="bg-gradient-to-br from-white to-sand-50 rounded-3xl p-7 border border-sand-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Weather Intelligence</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                Weather-Aware Outfit Suggestions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                WardrobeAI checks real-time forecasts for precipitation, heat, and cold:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-charcoal-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Rainy weather:</strong> Flags water-resistant outerwear and avoids delicate white footwear.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hot climates:</strong> Recommends lightweight cottons and short sleeves.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cold mornings:</strong> Automatically pairs structured blazers or insulated knits.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Anti-Repetition Intelligence */}
          <div className="bg-gradient-to-br from-white to-sand-50 rounded-3xl p-7 border border-sand-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold mb-4">
                <RotateCcw className="w-3.5 h-3.5 text-terracotta" />
                <span>Rotation Engine</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                Avoids Recently Repeated Outfits
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Never accidentally repeat the same combination to back-to-back meetings or classes:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-charcoal-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tracks last worn dates for each shirt, trouser, and blazer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Penalizes items worn within the past 48 hours to ensure fresh variety.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Surfaces hidden gems in your closet you haven't worn in weeks.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PHILOSOPHY: ZERO SHOPPING */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-charcoal-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta">
              Sustainable • Cost-Free • Intelligent
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              "Your Clothes. Not Shopping."
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Most fashion apps exist solely to sell you new inventory. WardrobeAI does the exact opposite: we believe your existing closet already holds dozens of sharp, cohesive combinations you've never thought to try.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-sand-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> No Affiliate Links
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> No Buy Now Buttons
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Private Local Closet
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK TRY PROMPTS CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
          Try an AI Prompt Right Now
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          Click any scenario below to see the recommendation engine match clothes from the demo wardrobe:
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {[
            'I have a presentation tomorrow',
            'I need something casual for college',
            'What should I wear if it rains tomorrow?',
            'Create a casual weekend outfit',
            'Use my blue shirt',
            'Don\'t use jeans'
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => onRunSamplePrompt(promptText)}
              className="px-4 py-2 rounded-xl bg-white border border-sand-300 text-xs sm:text-sm font-medium text-charcoal-800 hover:border-charcoal-900 hover:bg-sand-100 transition-all shadow-sm"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
