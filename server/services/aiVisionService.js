/**
 * AI Vision Service for WardrobeAI
 * 
 * Supports:
 * 1. Real Vision AI via Google Gemini or OpenAI (when API key is configured)
 * 2. Intelligent Mock/Demo Vision Analysis (fallback when no API key is provided)
 */

const fs = require('fs');

class AiVisionService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
  }

  isRealAiConfigured() {
    return Boolean(this.geminiApiKey || this.openaiApiKey);
  }

  getProviderInfo() {
    if (this.geminiApiKey) {
      return { provider: 'Google Gemini Vision', active: true, isMock: false };
    }
    if (this.openaiApiKey) {
      return { provider: 'OpenAI GPT-4o Vision', active: true, isMock: false };
    }
    return {
      provider: 'WardrobeAI Vision Heuristic Engine (Mock)',
      active: true,
      isMock: true,
      notice: 'To enable live multimodal LLM classification, set GEMINI_API_KEY or OPENAI_API_KEY in server/.env'
    };
  }

  async analyzeClothingImage({ filePath, filename, originalName, mimeType }) {
    // If real API key is configured, use real Vision API
    if (this.isRealAiConfigured()) {
      try {
        if (this.geminiApiKey) {
          return await this._analyzeWithGemini(filePath, mimeType);
        } else if (this.openaiApiKey) {
          return await this._analyzeWithOpenAI(filePath, mimeType);
        }
      } catch (err) {
        console.warn('Real AI Vision call failed, falling back to mock analyzer:', err.message);
      }
    }

    // Default: Intelligent Mock Vision Analyzer
    return this._mockAnalyze(filename, originalName);
  }

  _mockAnalyze(filename, originalName = '') {
    const input = `${filename || ''} ${originalName || ''}`.toLowerCase();

    // Keyword heuristic matching
    let category = 'Shirt';
    let color = 'Blue';
    let pattern = 'Solid';
    let style = 'Casual';
    let season = 'All season';
    let formality = 3;

    // Category detection
    if (input.includes('t-shirt') || input.includes('tshirt') || input.includes('tee')) {
      category = 'T-shirt';
      formality = 1;
      style = 'Casual';
    } else if (input.includes('shirt') || input.includes('oxford') || input.includes('button')) {
      category = 'Shirt';
      formality = 4;
      style = 'Semi-formal';
    } else if (input.includes('jean') || input.includes('denim')) {
      category = 'Jeans';
      formality = 2;
      style = 'Casual';
    } else if (input.includes('pant') || input.includes('trouser') || input.includes('chino') || input.includes('slacks')) {
      category = 'Trousers';
      formality = 4;
      style = input.includes('chino') ? 'Semi-formal' : 'Formal';
    } else if (input.includes('blazer') || input.includes('suit') || input.includes('tuxedo')) {
      category = 'Blazer';
      formality = 5;
      style = 'Formal';
    } else if (input.includes('jacket') || input.includes('coat') || input.includes('hoodie') || input.includes('sweater')) {
      category = 'Jacket';
      formality = input.includes('hoodie') ? 1 : 3;
      style = 'Casual';
      season = 'Winter';
    } else if (input.includes('shoe') || input.includes('sneaker') || input.includes('boot') || input.includes('loafer') || input.includes('oxford')) {
      category = 'Shoes';
      formality = input.includes('sneaker') ? 2 : 4;
      style = input.includes('sneaker') ? 'Casual' : 'Formal';
    } else if (input.includes('dress') || input.includes('gown')) {
      category = 'Dress';
      formality = 4;
      style = 'Formal';
    } else if (input.includes('skirt')) {
      category = 'Skirt';
      formality = 3;
      style = 'Casual';
    } else if (input.includes('watch') || input.includes('belt') || input.includes('tie') || input.includes('bag')) {
      category = 'Accessories';
      formality = 4;
    }

    // Color detection
    if (input.includes('white')) color = 'White';
    else if (input.includes('black')) color = 'Black';
    else if (input.includes('blue') || input.includes('navy') || input.includes('indigo')) color = 'Blue';
    else if (input.includes('grey') || input.includes('gray') || input.includes('charcoal')) color = 'Grey';
    else if (input.includes('red') || input.includes('maroon') || input.includes('burgundy')) color = 'Red';
    else if (input.includes('green') || input.includes('olive') || input.includes('sage')) color = 'Green';
    else if (input.includes('beige') || input.includes('khaki') || input.includes('tan') || input.includes('cream')) color = 'Beige';
    else if (input.includes('brown')) color = 'Brown';
    else if (input.includes('yellow')) color = 'Yellow';

    // Pattern detection
    if (input.includes('strip')) pattern = 'Striped';
    else if (input.includes('check') || input.includes('plaid') || input.includes('tartan')) pattern = 'Checked';
    else if (input.includes('print') || input.includes('graphic')) pattern = 'Printed';
    else if (input.includes('floral') || input.includes('flower')) pattern = 'Floral';
    else pattern = 'Solid';

    // Formality & Style overrides
    if (input.includes('formal') || input.includes('office') || input.includes('presentation')) {
      style = 'Formal';
      formality = Math.max(formality, 4);
    } else if (input.includes('sport') || input.includes('gym') || input.includes('track') || input.includes('athletic')) {
      style = 'Sporty';
      formality = 1;
    } else if (input.includes('traditional') || input.includes('ethnic') || input.includes('kurta')) {
      style = 'Traditional';
      formality = 4;
    }

    // Season overrides
    if (input.includes('summer') || input.includes('linen') || input.includes('short')) season = 'Summer';
    else if (input.includes('winter') || input.includes('wool') || input.includes('fleece') || input.includes('warm')) season = 'Winter';
    else if (input.includes('rain') || input.includes('monsoon') || input.includes('waterproof')) season = 'Monsoon';

    return {
      category,
      color,
      pattern,
      style,
      season,
      formality,
      confidence: 0.94,
      isMock: true,
      serviceProvider: 'WardrobeAI Computer Vision (Mock Heuristics)',
      detectedDetails: [
        `Identified category as ${category}`,
        `Detected dominant color shade: ${color}`,
        `Pattern profile classified as ${pattern}`,
        `Formality level rated at ${formality}/5 for ${style.toLowerCase()} attire`
      ]
    };
  }

  async _analyzeWithGemini(filePath, mimeType) {
    // Placeholder implementation for Google Gemini 1.5 Flash Vision
    const imageBytes = fs.readFileSync(filePath).toString('base64');
    const prompt = `Analyze this clothing item image and return strictly valid JSON matching this schema:
    {
      "category": "Shirt" | "T-shirt" | "Trousers" | "Jeans" | "Dress" | "Skirt" | "Jacket" | "Blazer" | "Shoes" | "Accessories" | "Other",
      "color": "Black" | "White" | "Blue" | "Red" | "Green" | "Yellow" | "Brown" | "Beige" | "Grey" | "Other",
      "pattern": "Solid" | "Striped" | "Checked" | "Printed" | "Floral" | "Other",
      "style": "Formal" | "Casual" | "Semi-formal" | "Sporty" | "Traditional",
      "season": "Summer" | "Winter" | "Monsoon" | "All season",
      "formality": 1 to 5,
      "detectedDetails": ["bullet point 1", "bullet point 2"]
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBytes } }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      isMock: false,
      confidence: 0.98,
      serviceProvider: 'Google Gemini 1.5 Flash Vision'
    };
  }

  async _analyzeWithOpenAI(filePath, mimeType) {
    // Placeholder implementation for OpenAI GPT-4o Vision
    const imageBytes = fs.readFileSync(filePath).toString('base64');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You analyze clothing images and return strictly JSON.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this clothing item for category, color, pattern, style, season, formality (1-5).' },
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBytes}` } }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      ...parsed,
      isMock: false,
      confidence: 0.98,
      serviceProvider: 'OpenAI GPT-4o Vision'
    };
  }
}

module.exports = new AiVisionService();
