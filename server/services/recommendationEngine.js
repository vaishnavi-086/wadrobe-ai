/**
 * WardrobeAI Recommendation Engine
 * 
 * Formulates personalized outfit combinations using ONLY clothes the user already owns.
 * Evaluates:
 * - Occasion & dress code match
 * - Weather constraints (temperature, rain, sunshine)
 * - Color harmony & style coherence
 * - Formality level alignment
 * - Natural Language constraints (mandatory inclusions, exclusions)
 * - History & recent wear penalties to avoid repeating looks
 */

const { db } = require('../database/db');
const weatherService = require('./weatherService');

class RecommendationEngine {
  /**
   * Parse natural language prompt into structured styling constraints
   */
  parsePrompt(promptText = '') {
    const text = promptText.toLowerCase().trim();

    // 1. Target date / day
    let targetDate = 'today';
    if (text.includes('tomorrow') || text.includes('next day')) {
      targetDate = 'tomorrow';
    } else if (text.includes('weekend') || text.includes('saturday') || text.includes('sunday')) {
      targetDate = 'weekend';
    }

    // 2. Occasion detection
    let occasion = 'Casual Everyday';
    let targetFormality = 2;

    if (text.includes('presentation') || text.includes('keynote') || text.includes('pitch')) {
      occasion = 'Presentation';
      targetFormality = 5;
    } else if (text.includes('interview') || text.includes('client meeting') || text.includes('boardroom')) {
      occasion = 'Job Interview / Executive Meeting';
      targetFormality = 5;
    } else if (text.includes('college') || text.includes('university') || text.includes('campus') || text.includes('class')) {
      occasion = 'College & Campus';
      targetFormality = 2;
    } else if (text.includes('formal') || text.includes('black tie') || text.includes('gala')) {
      occasion = 'Formal Event';
      targetFormality = 5;
    } else if (text.includes('office') || text.includes('work') || text.includes('business')) {
      occasion = 'Work / Office';
      targetFormality = 4;
    } else if (text.includes('date') || text.includes('dinner') || text.includes('evening')) {
      occasion = 'Date Night / Evening Dinner';
      targetFormality = 4;
    } else if (text.includes('party') || text.includes('celebration') || text.includes('club')) {
      occasion = 'Party / Celebration';
      targetFormality = 3;
    } else if (text.includes('rain') || text.includes('monsoon') || text.includes('storm')) {
      occasion = 'Rainy Day Travel';
      targetFormality = 2;
    } else if (text.includes('trip') || text.includes('travel') || text.includes('vacation')) {
      occasion = 'Travel & Trip';
      targetFormality = 2;
    } else if (text.includes('casual') || text.includes('weekend') || text.includes('relax')) {
      occasion = 'Casual Weekend';
      targetFormality = 2;
    } else if (text.includes('sport') || text.includes('gym') || text.includes('run')) {
      occasion = 'Athletic / Sport';
      targetFormality = 1;
    }

    // 3. User inclusions (e.g., "use my blue shirt", "with blazer", "wear sneakers")
    const inclusions = [];
    const colorMatches = ['white', 'blue', 'black', 'grey', 'gray', 'green', 'beige', 'brown', 'red'];
    const categoryMatches = ['shirt', 't-shirt', 'tshirt', 'tee', 'trousers', 'pants', 'jeans', 'blazer', 'jacket', 'shoes', 'sneakers'];

    if (text.includes('use') || text.includes('wear') || text.includes('with') || text.includes('haven\'t worn') || text.includes('have not worn')) {
      for (const col of colorMatches) {
        if (text.includes(col)) inclusions.push(col);
      }
      for (const cat of categoryMatches) {
        if (text.includes(cat)) inclusions.push(cat);
      }
    }

    // 4. User exclusions (e.g., "don't use jeans", "no shorts", "avoid black")
    const exclusions = [];
    const excludePatterns = [
      /don't\s+(?:use|wear)?\s*([a-z]+)/g,
      /no\s+([a-z]+)/g,
      /avoid\s+([a-z]+)/g,
      /without\s+([a-z]+)/g
    ];

    for (const pattern of excludePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) exclusions.push(match[1]);
      }
    }

    // 5. Outfit count request (e.g., "create 3 outfits for a 3-day trip")
    let count = 1;
    const countMatch = text.match(/(?:create|give|generate|suggest)\s+(\d+)\s+outfit/);
    if (countMatch && countMatch[1]) {
      count = Math.min(Math.max(parseInt(countMatch[1], 10), 1), 5);
    } else if (text.includes('3-day trip') || text.includes('3 day trip')) {
      count = 3;
    }

    return {
      rawPrompt: promptText,
      targetDate,
      occasion,
      targetFormality,
      inclusions: [...new Set(inclusions)],
      exclusions: [...new Set(exclusions)],
      count
    };
  }

  /**
   * Main recommendation generation function
   */
  async generateRecommendation({ prompt, city, weatherOverride }) {
    const constraints = this.parsePrompt(prompt);
    
    // Fetch contextual weather
    let weather;
    if (weatherOverride) {
      weatherService.setSimulationPreset(weatherOverride);
    }
    weather = await weatherService.getWeather(constraints.targetDate, city);

    // Weather constraint overrides
    if (weather.isRainy && !prompt.toLowerCase().includes('formal')) {
      constraints.inclusions.push('water-resistant');
    }

    // Query available wardrobe items
    const allItems = db.prepare('SELECT * FROM clothing_items').all();

    if (allItems.length === 0) {
      return {
        success: false,
        error: 'Your wardrobe is currently empty. Please add clothing items or enable Demo Mode to receive recommendations.',
        constraints,
        weather
      };
    }

    // Query wear history from recent days to calculate repetition penalties
    const recentWearLogs = db.prepare(`
      SELECT * FROM wear_history 
      ORDER BY worn_date DESC 
      LIMIT 15
    `).all();

    // Group items into slots
    const tops = allItems.filter(i => ['Shirt', 'T-shirt'].includes(i.category));
    const bottoms = allItems.filter(i => ['Trousers', 'Jeans', 'Skirt'].includes(i.category));
    const shoes = allItems.filter(i => i.category === 'Shoes');
    const outerwear = allItems.filter(i => ['Blazer', 'Jacket'].includes(i.category));
    const accessories = allItems.filter(i => i.category === 'Accessories');

    if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
      return {
        success: false,
        error: `Incomplete wardrobe setup. To build complete outfits, you need at least 1 top, 1 bottom, and 1 pair of shoes. Current inventory: ${tops.length} tops, ${bottoms.length} bottoms, ${shoes.length} shoes.`,
        constraints,
        weather
      };
    }

    // Generate valid combinations and score them
    const candidateOutfits = [];

    // Consider tops x bottoms x shoes
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoes) {
          // Check optional outerwear
          // If cold or formal presentation, strongly consider outerwear
          const possibleOuterwear = [null, ...outerwear];

          for (const outer of possibleOuterwear) {
            // If occasion is formal presentation or interview, a blazer is required if available
            if (constraints.targetFormality >= 4 && outer === null && outerwear.length > 0 && !constraints.exclusions.includes('blazer')) {
              continue; // prefer pairing with outerwear for high formality
            }

            // Score combination
            const items = [top, bottom, shoe];
            if (outer) items.push(outer);

            // Optional accessory for high formality
            let accessory = null;
            if (constraints.targetFormality >= 4 && accessories.length > 0) {
              accessory = accessories[0];
              items.push(accessory);
            }

            const evaluation = this.evaluateOutfitCombination({
              items,
              constraints,
              weather,
              recentWearLogs
            });

            candidateOutfits.push({
              items,
              slotMap: {
                top,
                bottom,
                shoes: shoe,
                outerwear: outer,
                accessory
              },
              ...evaluation
            });
          }
        }
      }
    }

    // Sort descending by score
    candidateOutfits.sort((a, b) => b.score - a.score);

    if (candidateOutfits.length === 0) {
      return {
        success: false,
        error: 'No suitable outfit could be matched with your current filters and constraints. Try relaxing some exclusions.',
        constraints,
        weather
      };
    }

    // Select distinct top recommendations
    const selectedOutfits = [];
    const usedTopIds = new Set();
    const usedBottomIds = new Set();

    for (const cand of candidateOutfits) {
      if (selectedOutfits.length >= constraints.count) break;

      const topId = cand.slotMap.top.id;
      const bottomId = cand.slotMap.bottom.id;

      // Ensure distinct outfits when user asks for multiple (e.g. 3-day trip)
      if (constraints.count > 1 && (usedTopIds.has(topId) && usedBottomIds.has(bottomId))) {
        continue;
      }

      usedTopIds.add(topId);
      usedBottomIds.add(bottomId);
      selectedOutfits.push(cand);
    }

    // If needed more, fill from top candidates
    while (selectedOutfits.length < constraints.count && candidateOutfits[selectedOutfits.length]) {
      selectedOutfits.push(candidateOutfits[selectedOutfits.length]);
    }

    const primaryOutfit = selectedOutfits[0];
    const alternativeOutfits = candidateOutfits
      .filter(c => c !== primaryOutfit && !selectedOutfits.includes(c))
      .slice(0, 3);

    return {
      success: true,
      query: prompt,
      constraints,
      weather,
      primaryOutfit,
      additionalOutfits: selectedOutfits.slice(1),
      alternatives: alternativeOutfits,
      totalCombinationsEvaluated: candidateOutfits.length,
      aiDifferentiator: {
        tagline: 'Not another fashion recommender. Your clothes. Your wardrobe. Your AI stylist.',
        guarantee: '100% generated from clothes you already own. Zero sponsored products.'
      }
    };
  }

  /**
   * Multi-factor scoring logic
   */
  evaluateOutfitCombination({ items, constraints, weather, recentWearLogs }) {
    let score = 50; // base score
    const breakdown = [];
    const whyPoints = [];

    const top = items.find(i => ['Shirt', 'T-shirt'].includes(i.category));
    const bottom = items.find(i => ['Trousers', 'Jeans', 'Skirt'].includes(i.category));
    const shoes = items.find(i => i.category === 'Shoes');
    const outer = items.find(i => ['Blazer', 'Jacket'].includes(i.category));

    // 1. Formality consistency & occasion match
    const avgFormality = items.reduce((acc, i) => acc + (i.formality || 3), 0) / items.length;
    const formalityDelta = Math.abs(avgFormality - constraints.targetFormality);
    
    if (formalityDelta <= 0.8) {
      score += 25;
      breakdown.push('Optimal formality alignment (+25)');
      if (constraints.targetFormality >= 4) {
        whyPoints.push(`Perfect for ${constraints.occasion}: Sharp, professional formality level (${Math.round(avgFormality)}/5)`);
      } else {
        whyPoints.push(`Matches ${constraints.occasion} atmosphere: Relaxed and appropriate tone`);
      }
    } else if (formalityDelta <= 1.5) {
      score += 10;
      breakdown.push('Acceptable formality (+10)');
    } else {
      score -= 20;
      breakdown.push(`Formality mismatch penalty (-20): Target was ${constraints.targetFormality} but outfit averaged ${avgFormality.toFixed(1)}`);
    }

    // 2. Intra-outfit cohesion (e.g., Don't wear a tuxedo blazer with gym shorts or t-shirt with dress oxfords if presentation)
    if (top && bottom) {
      const topBottomFormalityDiff = Math.abs(top.formality - bottom.formality);
      if (topBottomFormalityDiff <= 1) {
        score += 10;
        breakdown.push('Cohesive top & bottom silhouette (+10)');
      } else if (topBottomFormalityDiff >= 3) {
        score -= 25;
        breakdown.push('Top and bottom clash in formality level (-25)');
      }
    }

    // 3. Weather compatibility
    if (weather.isRainy) {
      // In rain: prefer water-resistant jackets, penalize white sneakers or delicate fabrics
      if (outer && (outer.season === 'Monsoon' || outer.name.toLowerCase().includes('field') || outer.name.toLowerCase().includes('water'))) {
        score += 20;
        whyPoints.push(`Weather ready for ${weather.temperature}°C with rain expected: Includes practical weather-resistant outerwear`);
      }
      if (shoes && shoes.color.toLowerCase() === 'white') {
        score -= 15;
        breakdown.push('Penalized white footwear on rainy day (-15)');
      } else if (shoes && (shoes.color.toLowerCase() === 'black' || shoes.color.toLowerCase() === 'brown')) {
        score += 10;
        whyPoints.push('Practical dark footwear selected to resist rain splatter');
      }
    } else if (weather.isHot) {
      // In heat: penalize heavy blazers/sweaters, favor tees and light cotton
      if (outer && outer.season === 'Winter') {
        score -= 25;
        breakdown.push('Penalized heavy winter outerwear in hot weather (-25)');
      } else if (top && top.category === 'T-shirt') {
        score += 15;
        whyPoints.push(`Temperature appropriate (${weather.temperature}°C): Lightweight breathable fabric`);
      }
    } else if (weather.isCold) {
      // In cold: reward layers
      if (outer) {
        score += 20;
        whyPoints.push(`Insulated for cool temperatures (${weather.temperature}°C): Structured layering with ${outer.name}`);
      } else {
        score -= 15;
        breakdown.push('Lacks outerwear layer in cold weather (-15)');
      }
    } else {
      whyPoints.push(`Weather suitable: Perfectly balanced for pleasant ${weather.temperature}°C climate`);
    }

    // 4. Color harmony
    const colors = items.map(i => i.color.toLowerCase());
    const isMonochrome = new Set(colors).size === 1;
    const hasNeutralAnchor = colors.some(c => ['black', 'white', 'grey', 'beige'].includes(c));
    const hasBlueAndBrown = colors.includes('blue') && colors.includes('brown');
    const hasBlueAndBeige = colors.includes('blue') && colors.includes('beige');
    const hasBlackAndWhite = colors.includes('black') && colors.includes('white');

    if (hasBlackAndWhite || hasBlueAndBeige || hasBlueAndBrown) {
      score += 15;
      whyPoints.push('Sophisticated classic color pairing with balanced contrast');
      breakdown.push('Classic color pairing match (+15)');
    } else if (hasNeutralAnchor) {
      score += 8;
      breakdown.push('Neutral color anchor present (+8)');
    }

    // 5. User constraints: Explicit inclusions
    for (const inc of constraints.inclusions) {
      const match = items.some(i => 
        i.name.toLowerCase().includes(inc) || 
        i.color.toLowerCase() === inc || 
        i.category.toLowerCase().includes(inc)
      );
      if (match) {
        score += 35;
        whyPoints.push(`Includes requested piece: matching "${inc}"`);
        breakdown.push(`User inclusion matched "${inc}" (+35)`);
      }
    }

    // 6. User constraints: Explicit exclusions
    for (const exc of constraints.exclusions) {
      const match = items.some(i => 
        i.name.toLowerCase().includes(exc) || 
        i.color.toLowerCase() === exc || 
        i.category.toLowerCase().includes(exc)
      );
      if (match) {
        score -= 100; // severe penalty
        breakdown.push(`Violated user exclusion "${exc}" (-100)`);
      }
    }

    // 7. Repetition Penalty / Wear History
    let recentWearPenalty = 0;
    const now = new Date();

    for (const item of items) {
      if (item.last_worn) {
        const lastWornDate = new Date(item.last_worn);
        const daysDiff = (now - lastWornDate) / (1000 * 60 * 60 * 24);

        if (daysDiff < 2) {
          recentWearPenalty += 15;
          breakdown.push(`Item "${item.name}" was worn very recently (< 2 days ago) (-15)`);
        } else if (daysDiff < 4) {
          recentWearPenalty += 5;
        } else if (daysDiff > 7) {
          // Bonus for refreshing neglected clothes
          score += 5;
        }
      }
    }

    // Check if full outfit combination matches past worn logs
    const itemNamesString = items.map(i => i.name).sort().join(', ');
    for (const log of recentWearLogs) {
      if (log.items_summary && items.every(i => log.items_summary.includes(i.name))) {
        recentWearPenalty += 30;
        breakdown.push(`Identical outfit was logged on ${log.worn_date} (-30)`);
      }
    }

    score -= recentWearPenalty;

    if (recentWearPenalty === 0) {
      whyPoints.push('Fresh combination: None of these items have been over-rotated this week');
    }

    // Always reinforce zero-shopping principle
    whyPoints.push('100% assembled from clothes in your personal closet');

    return {
      score: Math.max(Math.round(score * 10) / 10, 10),
      breakdown,
      whyThisOutfit: whyPoints.slice(0, 5)
    };
  }
}

module.exports = new RecommendationEngine();
