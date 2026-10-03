const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { db, seedDemoData } = require('../database/db');
const aiVisionService = require('../services/aiVisionService');
const weatherService = require('../services/weatherService');
const recommendationEngine = require('../services/recommendationEngine');

// Setup file upload destination
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `clothing-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/dashboard/stats', (req, res) => {
  try {
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM clothing_items').get().count;
    const tops = db.prepare("SELECT COUNT(*) as count FROM clothing_items WHERE category IN ('Shirt', 'T-shirt')").get().count;
    const bottoms = db.prepare("SELECT COUNT(*) as count FROM clothing_items WHERE category IN ('Trousers', 'Jeans', 'Skirt')").get().count;
    const shoes = db.prepare("SELECT COUNT(*) as count FROM clothing_items WHERE category = 'Shoes'").get().count;
    const outerwear = db.prepare("SELECT COUNT(*) as count FROM clothing_items WHERE category IN ('Blazer', 'Jacket')").get().count;

    const recentItems = db.prepare('SELECT * FROM clothing_items ORDER BY created_at DESC LIMIT 5').all();
    const recentWorn = db.prepare('SELECT * FROM wear_history ORDER BY worn_date DESC LIMIT 5').all();
    const savedCount = db.prepare('SELECT COUNT(*) as count FROM outfits WHERE is_saved = 1').get().count;

    res.json({
      success: true,
      stats: {
        totalItems,
        tops,
        bottoms,
        shoes,
        outerwear,
        savedOutfits: savedCount
      },
      recentItems,
      recentWorn
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. WARDROBE ITEMS
// ==========================================
router.get('/items', (req, res) => {
  try {
    const { category, color, style, season, search, sort } = req.query;
    let query = 'SELECT * FROM clothing_items WHERE 1=1';
    const params = {};

    if (category && category !== 'All') {
      query += ' AND category = @category';
      params.category = category;
    }
    if (color && color !== 'All') {
      query += ' AND color = @color';
      params.color = color;
    }
    if (style && style !== 'All') {
      query += ' AND style = @style';
      params.style = style;
    }
    if (season && season !== 'All') {
      query += ' AND season = @season';
      params.season = season;
    }
    if (search && search.trim()) {
      query += ' AND (name LIKE @search OR notes LIKE @search OR category LIKE @search OR color LIKE @search)';
      params.search = `%${search.trim()}%`;
    }

    if (sort === 'last_worn') {
      query += ' ORDER BY last_worn DESC';
    } else if (sort === 'formality_desc') {
      query += ' ORDER BY formality DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const items = db.prepare(query).all(params);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/items/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM clothing_items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/items', (req, res) => {
  try {
    const { name, image_url, category, color, pattern, style, season, formality, notes } = req.body;
    if (!name || !category || !color) {
      return res.status(400).json({ success: false, error: 'Name, category, and color are required.' });
    }

    const id = `item-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const created_at = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO clothing_items (id, name, image_url, category, color, pattern, style, season, formality, created_at, last_worn, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, ?)
    `);

    insert.run(
      id,
      name,
      image_url || '/placeholder-clothing.svg',
      category,
      color,
      pattern || 'Solid',
      style || 'Casual',
      season || 'All season',
      formality ? parseInt(formality, 10) : 3,
      created_at,
      notes || ''
    );

    const newItem = db.prepare('SELECT * FROM clothing_items WHERE id = ?').get(id);
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/items/:id', (req, res) => {
  try {
    const { name, image_url, category, color, pattern, style, season, formality, notes, last_worn } = req.body;
    const existing = db.prepare('SELECT * FROM clothing_items WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Item not found' });

    db.prepare(`
      UPDATE clothing_items
      SET name = @name,
          image_url = @image_url,
          category = @category,
          color = @color,
          pattern = @pattern,
          style = @style,
          season = @season,
          formality = @formality,
          notes = @notes,
          last_worn = @last_worn
      WHERE id = @id
    `).run({
      id: req.params.id,
      name: name ?? existing.name,
      image_url: image_url ?? existing.image_url,
      category: category ?? existing.category,
      color: color ?? existing.color,
      pattern: pattern ?? existing.pattern,
      style: style ?? existing.style,
      season: season ?? existing.season,
      formality: formality !== undefined ? parseInt(formality, 10) : existing.formality,
      notes: notes ?? existing.notes,
      last_worn: last_worn !== undefined ? last_worn : existing.last_worn
    });

    const updated = db.prepare('SELECT * FROM clothing_items WHERE id = ?').get(req.params.id);
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/items/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM clothing_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Item deleted from your wardrobe' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/items/:id/wear', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE clothing_items SET last_worn = ? WHERE id = ?').run(today, req.params.id);
    res.json({ success: true, last_worn: today });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/items/reset-demo', (req, res) => {
  try {
    seedDemoData(true);
    res.json({ success: true, message: 'Wardrobe reset to 12 curated demo items with initial wear logs!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. AI IMAGE UPLOAD & VISION ANALYSIS
// ==========================================
router.post('/ai/analyze-clothing', upload.single('image'), async (req, res) => {
  try {
    let filePath = null;
    let filename = '';
    let originalName = '';
    let mimeType = 'image/jpeg';
    let imageUrl = '';

    if (req.file) {
      filePath = req.file.path;
      filename = req.file.filename;
      originalName = req.file.originalname;
      mimeType = req.file.mimetype;
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
      originalName = req.body.originalName || 'uploaded_clothing';
    }

    const analysis = await aiVisionService.analyzeClothingImage({
      filePath,
      filename,
      originalName,
      mimeType
    });

    res.json({
      success: true,
      imageUrl: imageUrl || '/placeholder-clothing.svg',
      analysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/ai/status', (req, res) => {
  const providerInfo = aiVisionService.getProviderInfo();
  res.json({
    success: true,
    ...providerInfo
  });
});

// ==========================================
// 4. RECOMMENDATIONS
// ==========================================
router.post('/recommendations', async (req, res) => {
  try {
    const { prompt, city, weatherOverride } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'A natural language query is required.' });
    }

    const recommendation = await recommendationEngine.generateRecommendation({
      prompt: prompt.trim(),
      city: city || 'New York',
      weatherOverride
    });

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SAVED OUTFITS
// ==========================================
router.get('/outfits/saved', (req, res) => {
  try {
    const outfits = db.prepare('SELECT * FROM outfits WHERE is_saved = 1 ORDER BY created_at DESC').all();
    
    // Attach items for each outfit
    const enriched = outfits.map(outfit => {
      const items = db.prepare(`
        SELECT c.*, oi.slot_type 
        FROM outfit_items oi
        JOIN clothing_items c ON oi.clothing_item_id = c.id
        WHERE oi.outfit_id = ?
      `).all(outfit.id);

      return {
        ...outfit,
        items
      };
    });

    res.json({ success: true, outfits: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/outfits/save', (req, res) => {
  try {
    const { name, occasion, weather_summary, why_explanation, score, item_ids } = req.body;
    if (!name || !item_ids || !item_ids.length) {
      return res.status(400).json({ success: false, error: 'Outfit name and item IDs are required.' });
    }

    const outfitId = `outfit-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO outfits (id, name, occasion, weather_summary, why_explanation, score, is_saved, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      outfitId,
      name,
      occasion || 'Custom Combination',
      weather_summary || '',
      Array.isArray(why_explanation) ? why_explanation.join('\n') : (why_explanation || ''),
      score || 90,
      now
    );

    const insertItem = db.prepare('INSERT INTO outfit_items (id, outfit_id, clothing_item_id, slot_type) VALUES (?, ?, ?, ?)');
    item_ids.forEach((itemId, idx) => {
      insertItem.run(`oi-${Date.now()}-${idx}`, outfitId, itemId, 'slot');
    });

    res.status(201).json({ success: true, outfitId, message: 'Outfit saved to your curated favorites!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/outfits/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM outfit_items WHERE outfit_id = ?').run(req.params.id);
    db.prepare('DELETE FROM outfits WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Outfit deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark outfit as worn today
router.post('/outfits/wear', (req, res) => {
  try {
    const { outfit_id, outfit_name, item_ids, occasion, weather_desc, rating, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Get item names for the summary
    let itemsSummary = '';
    if (item_ids && item_ids.length > 0) {
      const placeholders = item_ids.map(() => '?').join(',');
      const items = db.prepare(`SELECT name FROM clothing_items WHERE id IN (${placeholders})`).all(...item_ids);
      itemsSummary = items.map(i => i.name).join(', ');

      // Update last_worn on all items
      const updateLastWorn = db.prepare('UPDATE clothing_items SET last_worn = ? WHERE id = ?');
      item_ids.forEach(id => updateLastWorn.run(today, id));
    }

    const wearId = `wear-${Date.now()}-${uuidv4().slice(0, 6)}`;
    db.prepare(`
      INSERT INTO wear_history (id, outfit_id, outfit_name, items_summary, worn_date, occasion, weather_desc, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      wearId,
      outfit_id || null,
      outfit_name || 'Daily Selected Outfit',
      itemsSummary,
      today,
      occasion || 'General Wear',
      weather_desc || 'Recorded wear',
      rating || 5,
      notes || ''
    );

    res.json({ success: true, wearId, wornDate: today, message: 'Outfit marked as worn today! Recommendation engine will prevent rapid repetition.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. WEAR HISTORY
// ==========================================
router.get('/history', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM wear_history ORDER BY worn_date DESC').all();
    res.json({ success: true, history: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/history/:id/rate', (req, res) => {
  try {
    const { rating, notes } = req.body;
    db.prepare('UPDATE wear_history SET rating = ?, notes = COALESCE(?, notes) WHERE id = ?')
      .run(rating, notes || null, req.params.id);
    res.json({ success: true, message: 'Rating updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. WEATHER
// ==========================================
router.get('/weather', async (req, res) => {
  try {
    const { targetDate, city } = req.query;
    const weather = await weatherService.getWeather(targetDate || 'today', city);
    const presets = weatherService.getPresetList();
    const cities = weatherService.getAvailableCities();
    res.json({ success: true, weather, presets, cities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/weather/preset', (req, res) => {
  try {
    const { preset } = req.body;
    weatherService.setSimulationPreset(preset);
    res.json({ success: true, activePreset: preset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
