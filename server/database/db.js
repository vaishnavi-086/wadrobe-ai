const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'wardrobe.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clothing_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    pattern TEXT DEFAULT 'solid',
    style TEXT DEFAULT 'casual',
    season TEXT DEFAULT 'all-season',
    formality INTEGER DEFAULT 3,
    created_at TEXT NOT NULL,
    last_worn TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    occasion TEXT,
    weather_summary TEXT,
    why_explanation TEXT,
    score REAL DEFAULT 0,
    is_saved INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS outfit_items (
    id TEXT PRIMARY KEY,
    outfit_id TEXT NOT NULL,
    clothing_item_id TEXT NOT NULL,
    slot_type TEXT NOT NULL,
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
    FOREIGN KEY (clothing_item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wear_history (
    id TEXT PRIMARY KEY,
    outfit_id TEXT,
    outfit_name TEXT,
    items_summary TEXT,
    worn_date TEXT NOT NULL,
    occasion TEXT,
    weather_desc TEXT,
    rating INTEGER DEFAULT 5,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY,
    pref_key TEXT UNIQUE NOT NULL,
    pref_value TEXT NOT NULL
  );
`);

// Clean high-aesthetic SVG generator for demo items
function generateClothingSvg(category, colorHex, label, accentHex = '#333333') {
  const bg = '#f6f4ee';
  let pathD = '';
  let details = '';

  if (category === 'Shirt' || category === 'T-shirt') {
    pathD = 'M35,30 L65,30 L78,42 L72,55 L60,48 L60,90 L40,90 L40,48 L28,55 L22,42 Z';
    details = `<path d="M44,30 L50,42 L56,30" stroke="${accentHex}" stroke-width="1.5" fill="none"/>
               <line x1="50" y1="42" x2="50" y2="88" stroke="${accentHex}" stroke-width="1" stroke-dasharray="2,2"/>`;
  } else if (category === 'Trousers' || category === 'Jeans') {
    pathD = 'M34,25 L66,25 L64,88 L52,88 L50,48 L48,88 L36,88 Z';
    details = `<line x1="34" y1="30" x2="66" y2="30" stroke="${accentHex}" stroke-width="1.5"/>
               <line x1="50" y1="28" x2="50" y2="48" stroke="${accentHex}" stroke-width="1"/>`;
  } else if (category === 'Blazer' || category === 'Jacket') {
    pathD = 'M32,25 L68,25 L82,45 L74,58 L62,50 L62,90 L38,90 L38,50 L26,58 L18,45 Z';
    details = `<path d="M42,25 L50,56 L58,25" fill="${accentHex}" opacity="0.3"/>
               <line x1="50" y1="56" x2="50" y2="88" stroke="${accentHex}" stroke-width="1.5"/>
               <circle cx="48" cy="62" r="1.5" fill="${accentHex}"/>
               <circle cx="48" cy="72" r="1.5" fill="${accentHex}"/>`;
  } else if (category === 'Shoes') {
    pathD = 'M25,65 Q35,45 55,50 Q75,48 82,62 L82,75 Q60,78 25,75 Z';
    details = `<line x1="30" y1="72" x2="80" y2="72" stroke="${accentHex}" stroke-width="2"/>
               <circle cx="45" cy="55" r="1" fill="${accentHex}"/>
               <circle cx="52" cy="54" r="1" fill="${accentHex}"/>`;
  } else {
    // Accessories / Other
    pathD = 'M35,35 L65,35 L65,65 L35,65 Z';
    details = `<circle cx="50" cy="50" r="10" stroke="${accentHex}" stroke-width="1.5" fill="none"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="#ebe6da" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#cardBg)"/>
    <g transform="translate(0, 2)">
      <path d="${pathD}" fill="${colorHex}" stroke="${accentHex}" stroke-width="1.5" stroke-linejoin="round"/>
      ${details}
    </g>
    <text x="50" y="96" font-family="Inter, sans-serif" font-size="5.5" font-weight="600" fill="#4a463e" text-anchor="middle" letter-spacing="0.5">${label.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DEMO_ITEMS = [
  {
    id: 'item-1',
    name: 'White Formal Oxford Shirt',
    category: 'Shirt',
    color: 'White',
    pattern: 'Solid',
    style: 'Formal',
    season: 'All season',
    formality: 5,
    last_worn: '2026-09-27',
    notes: 'Premium crisp cotton, tailored fit. Ideal for presentations and interviews.',
    colorHex: '#FFFFFF',
    accentHex: '#94a3b8'
  },
  {
    id: 'item-2',
    name: 'Navy Blue Casual Shirt',
    category: 'Shirt',
    color: 'Blue',
    pattern: 'Solid',
    style: 'Semi-formal',
    season: 'All season',
    formality: 3,
    last_worn: '2026-09-29',
    notes: 'Linen blend, comfortable for office or weekend brunch.',
    colorHex: '#1e3a8a',
    accentHex: '#0f172a'
  },
  {
    id: 'item-3',
    name: 'Heather Grey Crewneck Tee',
    category: 'T-shirt',
    color: 'Grey',
    pattern: 'Solid',
    style: 'Casual',
    season: 'Summer',
    formality: 1,
    last_worn: '2026-10-01',
    notes: 'Breathable organic pima cotton.',
    colorHex: '#9ca3af',
    accentHex: '#4b5563'
  },
  {
    id: 'item-4',
    name: 'Black Formal Trousers',
    category: 'Trousers',
    color: 'Black',
    pattern: 'Solid',
    style: 'Formal',
    season: 'All season',
    formality: 5,
    last_worn: '2026-09-27',
    notes: 'Slim pleated trousers with crease protection.',
    colorHex: '#18181b',
    accentHex: '#27272a'
  },
  {
    id: 'item-5',
    name: 'Beige Slim Chinos',
    category: 'Trousers',
    color: 'Beige',
    pattern: 'Solid',
    style: 'Semi-formal',
    season: 'All season',
    formality: 3,
    last_worn: '2026-09-28',
    notes: 'Stretch khaki fabric, versatile across styles.',
    colorHex: '#d4c4a8',
    accentHex: '#786951'
  },
  {
    id: 'item-6',
    name: 'Classic Indigo Blue Jeans',
    category: 'Jeans',
    color: 'Blue',
    pattern: 'Solid',
    style: 'Casual',
    season: 'All season',
    formality: 2,
    last_worn: '2026-09-30',
    notes: 'Raw denim straight leg, timeless silhouette.',
    colorHex: '#2563eb',
    accentHex: '#1e40af'
  },
  {
    id: 'item-7',
    name: 'Tailored Black Blazer',
    category: 'Blazer',
    color: 'Black',
    pattern: 'Solid',
    style: 'Formal',
    season: 'All season',
    formality: 5,
    last_worn: '2026-09-22',
    notes: 'Italian wool blend, structured shoulders, double-vented back.',
    colorHex: '#09090b',
    accentHex: '#3f3f46'
  },
  {
    id: 'item-8',
    name: 'Olive Green Field Jacket',
    category: 'Jacket',
    color: 'Green',
    pattern: 'Solid',
    style: 'Casual',
    season: 'Monsoon',
    formality: 2,
    last_worn: '2026-09-18',
    notes: 'Water-resistant coated canvas with storm flap.',
    colorHex: '#4d5d43',
    accentHex: '#2d3728'
  },
  {
    id: 'item-9',
    name: 'Oxford Black Formal Shoes',
    category: 'Shoes',
    color: 'Black',
    pattern: 'Solid',
    style: 'Formal',
    season: 'All season',
    formality: 5,
    last_worn: '2026-09-27',
    notes: 'Polished calfskin leather with Goodyear welt.',
    colorHex: '#09090b',
    accentHex: '#52525b'
  },
  {
    id: 'item-10',
    name: 'Minimalist White Sneakers',
    category: 'Shoes',
    color: 'White',
    pattern: 'Solid',
    style: 'Casual',
    season: 'Summer',
    formality: 2,
    last_worn: '2026-10-01',
    notes: 'Low-top clean white leather court shoes.',
    colorHex: '#f8fafc',
    accentHex: '#cbd5e1'
  },
  {
    id: 'item-11',
    name: 'Classic Black Belt & Chrono Watch',
    category: 'Accessories',
    color: 'Black',
    pattern: 'Solid',
    style: 'Formal',
    season: 'All season',
    formality: 4,
    last_worn: '2026-09-27',
    notes: 'Full-grain leather belt and sapphire crystal timepiece.',
    colorHex: '#27272a',
    accentHex: '#d4d4d8'
  },
  {
    id: 'item-12',
    name: 'Charcoal Merino Wool Sweater',
    category: 'Jacket',
    color: 'Grey',
    pattern: 'Solid',
    style: 'Semi-formal',
    season: 'Winter',
    formality: 3,
    last_worn: '2026-09-15',
    notes: 'Soft insulating fine knit, great for layering.',
    colorHex: '#374151',
    accentHex: '#1f2937'
  }
];

function seedDemoData(force = false) {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM clothing_items').get().count;
  if (existingCount > 0 && !force) {
    return;
  }

  if (force) {
    db.prepare('DELETE FROM outfit_items').run();
    db.prepare('DELETE FROM outfits').run();
    db.prepare('DELETE FROM wear_history').run();
    db.prepare('DELETE FROM clothing_items').run();
  }

  const insertItem = db.prepare(`
    INSERT INTO clothing_items (id, name, image_url, category, color, pattern, style, season, formality, created_at, last_worn, notes)
    VALUES (@id, @name, @image_url, @category, @color, @pattern, @style, @season, @formality, @created_at, @last_worn, @notes)
  `);

  const now = new Date().toISOString();

  DEMO_ITEMS.forEach(item => {
    const svgUrl = generateClothingSvg(item.category, item.colorHex, item.category, item.accentHex);
    insertItem.run({
      id: item.id,
      name: item.name,
      image_url: svgUrl,
      category: item.category,
      color: item.color,
      pattern: item.pattern,
      style: item.style,
      season: item.season,
      formality: item.formality,
      created_at: now,
      last_worn: item.last_worn,
      notes: item.notes
    });
  });

  // Seed sample Wear History (to demonstrate repetition penalty and wear logs)
  const insertWear = db.prepare(`
    INSERT INTO wear_history (id, outfit_id, outfit_name, items_summary, worn_date, occasion, weather_desc, rating, notes)
    VALUES (@id, @outfit_id, @outfit_name, @items_summary, @worn_date, @occasion, @weather_desc, @rating, @notes)
  `);

  insertWear.run({
    id: 'wear-1',
    outfit_id: 'sample-outfit-1',
    outfit_name: 'Executive Keynote Outfit',
    items_summary: 'White Formal Oxford Shirt, Black Formal Trousers, Tailored Black Blazer, Oxford Black Shoes',
    worn_date: '2026-09-27',
    occasion: 'Quarterly Business Review',
    weather_desc: '22°C Clear and Mild',
    rating: 5,
    notes: 'Sharp and authoritative. Felt very confident during the presentation.'
  });

  insertWear.run({
    id: 'wear-2',
    outfit_id: 'sample-outfit-2',
    outfit_name: 'Smart Casual Friday',
    items_summary: 'Navy Blue Casual Shirt, Beige Slim Chinos, Minimalist White Sneakers',
    worn_date: '2026-09-29',
    occasion: 'Client Lunch & Office',
    weather_desc: '25°C Partly Cloudy',
    rating: 4,
    notes: 'Comfortable and relaxed yet polished.'
  });

  // Seed 2 sample Saved Outfits
  const insertOutfit = db.prepare(`
    INSERT INTO outfits (id, name, occasion, weather_summary, why_explanation, score, is_saved, created_at)
    VALUES (@id, @name, @occasion, @weather_summary, @why_explanation, @score, @is_saved, @created_at)
  `);

  insertOutfit.run({
    id: 'outfit-saved-1',
    name: 'Executive Presentation Outfit',
    occasion: 'Presentation / Formal',
    weather_summary: '23°C Mild',
    why_explanation: '• Crisp contrast between white shirt and black tailoring\n• Maximum professional formality (Level 5)\n• Breathable cotton-wool for stage confidence',
    score: 96.5,
    is_saved: 1,
    created_at: '2026-09-26T10:00:00Z'
  });

  const insertOutfitItem = db.prepare(`
    INSERT INTO outfit_items (id, outfit_id, clothing_item_id, slot_type)
    VALUES (@id, @outfit_id, @clothing_item_id, @slot_type)
  `);

  insertOutfitItem.run({ id: 'oi-1', outfit_id: 'outfit-saved-1', clothing_item_id: 'item-1', slot_type: 'top' });
  insertOutfitItem.run({ id: 'oi-2', outfit_id: 'outfit-saved-1', clothing_item_id: 'item-4', slot_type: 'bottom' });
  insertOutfitItem.run({ id: 'oi-3', outfit_id: 'outfit-saved-1', clothing_item_id: 'item-7', slot_type: 'outerwear' });
  insertOutfitItem.run({ id: 'oi-4', outfit_id: 'outfit-saved-1', clothing_item_id: 'item-9', slot_type: 'shoes' });

  insertOutfit.run({
    id: 'outfit-saved-2',
    name: 'Weekend Coffee & Casual Walk',
    occasion: 'Casual Weekend',
    weather_summary: '26°C Sunny',
    why_explanation: '• Relaxed comfort with breathable organic cotton\n• Neutral tone harmony with classic denim\n• All-day walking sneakers',
    score: 92.0,
    is_saved: 1,
    created_at: '2026-09-28T14:30:00Z'
  });

  insertOutfitItem.run({ id: 'oi-5', outfit_id: 'outfit-saved-2', clothing_item_id: 'item-3', slot_type: 'top' });
  insertOutfitItem.run({ id: 'oi-6', outfit_id: 'outfit-saved-2', clothing_item_id: 'item-6', slot_type: 'bottom' });
  insertOutfitItem.run({ id: 'oi-7', outfit_id: 'outfit-saved-2', clothing_item_id: 'item-10', slot_type: 'shoes' });

  console.log(`Wardrobe database seeded with ${DEMO_ITEMS.length} items, wear history, and saved outfits.`);
}

// Auto-seed on startup
seedDemoData(false);

module.exports = {
  db,
  seedDemoData,
  generateClothingSvg
};
