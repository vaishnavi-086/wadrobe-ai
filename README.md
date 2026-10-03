# 👗 WardrobeAI

### Your wardrobe. Your style. Smarter choices.

WardrobeAI is an AI-powered digital wardrobe that helps users create outfit combinations using the clothes they already own.

Instead of recommending products to purchase, WardrobeAI builds a digital version of the user's wardrobe and generates outfit suggestions based on factors such as occasion, dress code, weather, personal style, and previous outfits.

---

## 📌 Problem Statement

People often own many clothes but still struggle to decide what to wear.

Traditional fashion recommendation systems frequently focus on suggesting new products to buy. This does not solve the problem of making better use of the clothes a person already owns.

Users need a simple way to:

- Organize their existing wardrobe
- Know what clothes they actually own
- Find suitable combinations
- Choose outfits for different occasions
- Consider weather and dress codes
- Avoid repeatedly wearing the same combinations

---

## 💡 Our Solution

WardrobeAI transforms a user's physical wardrobe into a **digital wardrobe**.

The user uploads photos of their clothes, and the system organizes them based on attributes such as:

- Category
- Color
- Pattern
- Style
- Season
- Formality

The user can then request an outfit for a particular situation, such as:

> "I need something for a college presentation tomorrow."

WardrobeAI analyzes the available wardrobe and generates an outfit using clothes the user already owns.

### Core Principle

> **Use what you already own.**

---

## ✨ Key Features

### 📸 Digital Wardrobe

Upload clothing images and maintain a digital collection of the clothes you own.

### 🤖 AI Clothing Recognition

Analyze uploaded clothing images and extract useful clothing attributes.

### 👕 Outfit Recommendations

Generate combinations of clothing items based on the user's requirements.

### 🎯 Occasion-Based Suggestions

Recommendations can consider different situations such as:

- College
- Casual outings
- Presentations
- Formal events
- Parties
- Daily wear

### 🌦️ Weather-Aware Recommendations

Weather information can be considered when generating outfit suggestions.

For example:

- Hot weather → lighter clothing
- Cold weather → warmer layers
- Rainy weather → suitable clothing choices

### 👔 Dress-Code Awareness

The recommendation system can consider whether the user needs a casual, semi-formal, or formal outfit.

### 📅 Outfit History

Previously used outfits can be recorded so that recommendations can take outfit repetition into account.

### ❤️ Saved Outfits

Users can save outfit combinations they like for future use.

---

## 🔄 How WardrobeAI Works

```text
        USER
          │
          ▼
   Upload Clothing Photos
          │
          ▼
   AI Clothing Recognition
          │
          ▼
    Digital Wardrobe
          │
          ├───────────────┐
          │               │
          ▼               ▼
      Weather         User Request
          │               │
          └───────┬───────┘
                  ▼
        Recommendation Engine
                  │
                  ▼
          Outfit Suggestions
                  │
                  ▼
             User Choice
                  │
                  ▼
           Outfit History
