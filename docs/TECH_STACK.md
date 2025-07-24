# Technology Stack

This document provides a detailed breakdown of all major frameworks and libraries used throughout the project, including package names as referenced in `package.json` and configuration files.

## Analysis Engine Architecture

The application features a sophisticated multi-tier analysis system powered by industry-standard tools:

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

### Core Server Infrastructure
* **Node.js** - Runtime environment
* **Express.js** - Package: `express`
  * RESTful API architecture with specialized analysis endpoints
  * Middleware for request validation and error handling

### Analysis Engine Components

#### Browser Automation & Content Extraction
* **Playwright** 🎭 - Package: `playwright`
  * Headless Chromium automation for real website rendering
  * Content extraction: fonts, images, colors, text content
  * Page screenshot and DOM analysis capabilities
  * Components using: ContentAnalysisTab, ImageAnalysisCard, FontAnalysisCard, ColorExtractionCard

#### Performance & SEO Analysis
* **Lighthouse** - Package: `lighthouse`
  * Comprehensive performance auditing
  * SEO audit scoring and recommendations
  * Best practices compliance assessment
  * Core Web Vitals measurement from real scenarios
  * API endpoints: `/api/lighthouse/seo`, `/api/lighthouse/performance`, `/api/lighthouse/best-practices`

#### Accessibility Testing
* **axe-core** - Package: `@axe-core/playwright`
  * Real-time accessibility testing integrated with Playwright
  * WCAG compliance checking with actionable recommendations
  * Color contrast analysis from rendered websites
  * Integrated into color extraction API for accessibility scoring

#### Content Analysis
* **Mozilla Readability** - Package: `@mozilla/readability`
  * Article content extraction and word counting
  * Flesch-Kincaid readability scoring on authentic text
  * Components using: ContentAnalysisTab (readability scores)

* **JSDOM** - Package: `jsdom`
  * Server-side DOM manipulation for content analysis
  * HTML parsing and element extraction

#### Enhanced Tech Detection
* **Lightweight Pattern Analysis** - Custom implementation
  * HTTP-based technology detection without browser context conflicts
  * Real-time pattern matching for frameworks (React, Vue, Angular, Next.js, Nuxt.js, Svelte, D3.js)
  * Security headers analysis (CSP, HSTS, X-Frame-Options)
  * Minification detection using content analysis patterns
  * Social platform integration detection (Open Graph, Twitter Cards, analytics)

### Database & Caching
* **Supabase** - Package: `@supabase/supabase-js`
  * PostgreSQL database with real-time capabilities
  * Server-side client with service role permissions
  * 24-hour TTL caching for analysis results

* **Drizzle ORM** - Packages: `drizzle-orm`, `drizzle-kit`
  * Type-safe database operations
  * Schema migration management

* **Drizzle Zod** - Package: `drizzle-zod`
  * Runtime validation with TypeScript integration

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

### API Endpoints & Caching Strategy

#### Main Analysis
* `/api/analyze/full` - Complete analysis with PageSpeed Insights data and Supabase caching
* `/api/analyze` - Legacy endpoint (redirects to main analysis for backward compatibility)

#### Unified Analysis Architecture
* `/api/overview` - Primary endpoint for comprehensive website analysis (single-scrape + single-endpoint pattern)
* `/api/scan` - Queue-based website scraping with concurrency control and per-domain throttling

#### Intelligent Caching Architecture
1. **In-memory cache** (30 minutes) for ultra-fast repeated requests
2. **Supabase cache** (24 hours) with schema version 1.1.0:
   - `ui_{hash}` - Complete UI analysis (colors, fonts, accessibility, images)
   - Enhanced TTL: 24h for successful scrapes, 15min for failed ones
   - Cache invalidation for stale data with schema versioning
3. **Request deduplication** to prevent duplicate API calls during concurrent requests

#### Performance Metrics
- **Cache hits**: 109-242ms response time (vs 7-25 seconds for fresh analysis)
- **Main analysis**: 9-25 seconds for comprehensive data with progressive section loading
- **Section-level loading**: Each dashboard section shows loading indicators independently
- **Fallback handling**: Graceful degradation when comprehensive analysis fails

## Lighthouse-Powered Architecture

The application uses a comprehensive Lighthouse-based analysis system:

### Current Architecture
- **Lighthouse** - Local comprehensive auditing without external API dependencies
- **Enhanced Tech Detection** - Custom pattern-based technology detection
- **Playwright Integration** - Real browser-based analysis for authentic dataities

### Current Architecture (Enhanced)
- **Lighthouse** - Local Lighthouse audits providing comprehensive analysis without external API dependencies
- **Enhanced Tech Detection** - Dual-layer system combining lightweight HTTP analysis with Lighthouse best practices
- **axe-core Integration** - Real accessibility testing with contrast analysis
- **Intelligent Fallback System** - Graceful degradation when comprehensive analysis fails

### Benefits of Migration
1. **Reduced External Dependencies** - No API key requirements for core functionality
2. **Enhanced Analysis Depth** - More comprehensive technical insights
3. **Better Performance** - Local analysis reduces network latency
4. **Improved Reliability** - Fallback mechanisms ensure users always receive authentic data
5. **Real Accessibility Testing** - axe-core provides actual WCAG compliance checking

*For details on exact versions and full dependency list, refer to `package.json` files in the root and server directories.*
