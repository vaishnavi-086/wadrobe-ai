import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="bg-charcoal-900 text-white rounded-2xl p-4 sm:p-5 mb-8 shadow-sm border border-charcoal-700/60 relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-sage/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-sage" />
            <span>Guaranteed Zero Shopping Principle</span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-white">
            "Not another fashion recommender. <span className="italic text-sand-200">Your clothes. Your wardrobe. Your AI stylist.</span>"
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Recommendations are generated <strong className="text-white font-medium underline decoration-terracotta/60 decoration-2">exclusively from clothes you already own</strong>. No sponsored links, no shopping carts, no pressure to buy.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-sand-200 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Private Closet Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
