# Technology Stack

This document provides a detailed breakdown of all major frameworks and libraries used throughout the project, including package names as referenced in `package.json` and configuration files.

## Frontend Frameworks & Libraries

* **React**

  * Packages: `react`, `react-dom`
* **Vite**

  * Packages: `vite`, `@vitejs/plugin-react`
* **Tailwind CSS**

  * Packages: `tailwindcss`
* **Material UI**

  * Packages: `@mui/material`, `@mui/icons-material`
* **Radix UI**

  * Packages: `@radix-ui/react-<component>` (various)
* **Emotion**

  * Packages: `@emotion/react`, `@emotion/styled`

## Backend Frameworks & Libraries

* **Node.js**
  * Runtime environment
* **Express.js**
  * Package: `express`
* **Playwright** 🎭
  * Package: `playwright`
  * Used for: Headless browser automation, content extraction, image classification
  * Components using: ContentAnalysisTab, ImageAnalysisCard
* **Mozilla Readability**
  * Package: `@mozilla/readability`
  * Used for: Article content extraction and word counting
  * Components using: ContentAnalysisTab (readability scores)
* **JSDOM**
  * Package: `jsdom`
  * Used for: Server-side DOM manipulation for content analysis
* **Drizzle ORM**
  * Packages: `drizzle-orm`, `drizzle-orm/neon-serverless`
* **Drizzle Zod**
  * Package: `drizzle-zod`
* **Supabase JS Client**
  * Package: `@supabase/supabase-js`
* **Wappalyzer**
  * Package: `wappalyzer`
* **Neon Database**
  * Package: `@neondatabase/serverless`

## Content Analysis Integration

### Frontend Components Using Playwright Data

**ContentAnalysisTab.tsx** - Real content metrics
* Word count extraction via @mozilla/readability
* Flesch-Kincaid readability scoring
* Text content visualization from authentic scraping

**ImageAnalysisCard.tsx** - Enhanced image classification
* 32×32 pixel area threshold (>1024px² = photo, else icon)
* Real photo/icon URLs from DOM inspection
* Authentic metadata replacing estimation algorithms

**useEnhancedContent.ts** - Progressive data loading hook
* Fetches Playwright data after quick analysis
* Handles loading states and fallback markers ("!")

### API Endpoints

* `/api/analyze/quick` - Immediate overview with fallback markers
* `/api/analyze/content` - Playwright-powered deep content analysis
* `/api/colors` - Real color extraction from rendered websites

*For details on exact versions and full dependency list, refer to `package.json` files in the root and server directories.*
