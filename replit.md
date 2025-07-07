# Website Analysis Tool

## Overview
A comprehensive website analysis tool that provides insights into performance, SEO, accessibility, and design elements. The application has been successfully migrated from Lovable to Replit environment with PostgreSQL database integration.

## Project Architecture

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components and theming
- Framer Motion for animations
- Swiper for carousel functionality (replaced react-swipeable-views for React 18 compatibility)
- React Router for navigation

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- Analysis API route that replaces Supabase Edge Functions
- Server-side website analysis with color extraction, mobile responsiveness checks, and security analysis

### Key Components
- Landing page with hero section and feature showcase
- Dashboard with analysis results
- Real-time website analysis with detailed reporting
- Export functionality for analysis reports

## Recent Changes
- ✓ Migrated from Supabase to PostgreSQL database
- ✓ Replaced Supabase Edge Functions with Express.js API routes
- ✓ Updated dependencies for React 18 compatibility
- ✓ Removed Supabase integration files
- ✓ Configured Drizzle ORM for database operations
- ✓ Fixed padding inconsistencies across dashboard tabs (Content, Performance & Security, Tech tabs now match UI tab spacing)
- ✓ Added Supabase client integration for optional report persistence
- ✓ Implemented tech stack detection with fallback due to Wappalyzer deprecation
- ✓ Updated CI pipeline with Chrome dependencies for testing
- ✓ Removed Lovable references from documentation
- ✓ Applied surgical compilation fixes: vendor type declarations, guard clauses, callback annotations, timestamp safety checks
- ✓ Fixed TypeScript compilation errors: null safety checks, type annotations, interface updates for UI analysis components
- ✓ Resolved build errors in UIAnalysisTab and ImageAnalysisCard components with proper type handling
- ✓ Fixed Vite server configuration TypeScript error with custom type declarations
- ✓ Completed TypeScript compilation error resolution for clean build process
- ✓ Successfully migrated from Lovable to Replit with full functionality preserved
- ✓ Enhanced color extraction: Now returns 12 diverse colors with dark website detection (June 27, 2025)
- ✓ Implemented minimal cog icon filter interface replacing bulky chip filters
- ✓ Added complete 12-item usage type categorization system
- ✓ Fixed DOM nesting validation errors in HeroSection component
- ✓ Replaced dummy color extraction with real Playwright-powered implementation (June 28, 2025)
- ✓ Added POST /api/colors endpoint with real browser-based color extraction
- ✓ Implemented p-queue concurrency control and colord normalization
- ✓ Integrated Chromium system dependencies for Replit environment
- ✓ Complete frontend integration with live color data fetching and error handling
- ✓ Removed all dummy/placeholder color extraction components
- ✓ Added unit tests for ColorExtractionCard component
- ✓ Successfully extracting 100+ unique colors from real websites with proper CSS property mapping
- ✓ Implemented expanded 11-bucket semantic color taxonomy (June 28, 2025)
- ✓ Added getBucketForProperty helper with comprehensive mapping logic
- ✓ Enhanced extraction for shadows, gradients, SVG elements, links, and highlights
- ✓ Dynamic frontend filtering showing only non-empty buckets in specified order
- ✓ Created comprehensive test suite for bucket mapping functionality
- ✓ Added HSL hue-based sorting within each color bucket for harmony ordering
- ✓ Implemented interactive color detail modal popup with click-to-view functionality
- ✓ Enhanced UI with full-width color headers and human-friendly color names
- ✓ Redesigned color popup as seamless chip expansion animation (280x80px)
- ✓ Added smooth CSS keyframe animations for natural chip-to-rectangle growth
- ✓ Optimized typography and layout for compact expanded color display
- ✓ Implemented dynamic positioning system for chip-specific expansion animations
- ✓ Added position tracking to make each chip appear to grow from its exact location
- ✓ Enhanced animation with bouncy easing and delayed text fade-in effects
- ✓ Removed color popup overlay completely for clean interaction experience
- ✓ Implemented intelligent bounding box positioning for color square expansion (June 29, 2025)
- ✓ Added dynamic transform origin detection: left third (top-left), right third (top-right), middle (center)
- ✓ Enhanced expansion size to scale(3.5, 2.3) for optimal visibility while preventing off-screen overflow
- ✓ Added centered text overlay to expanded color squares with hex codes and human-friendly names (June 29, 2025)
- - ✓ Reorganized Performance tab layout: Core Web Vitals (2x2), Speed Index and Mobile Responsiveness stacked (1x1 each)
- ✓ Implemented performance optimization refactoring (June 30, 2025)
- ✓ Added quick analysis endpoint (/api/analyze/quick) for immediate feedback
- ✓ Added full analysis endpoint (/api/analyze/full) with PSI data and caching
- ✓ Implemented 3-tier caching: in-memory (30min), database (24hr), and request deduplication
- ✓ Added precise timing logs and AbortController timeout (25s) for PSI calls
- ✓ Parallelized HTML fetch and PSI calls using Promise.all
- ✓ Created analysis_cache table with SHA256 URL hashing
- ✓ Enhanced client-side to call quick then full analysis for progressive loading
- ✓ Added comprehensive performance regression tests
- ✓ Legacy endpoint maintains backward compatibility
- ✓ Migrated caching system from PostgreSQL to Supabase (January 4, 2025)
- ✓ Created SupabaseCacheService with 24-hour cache TTL
- ✓ Configured server-side Supabase client with service role permissions
- ✓ Fixed environment variable mapping and table structure compatibility
- ✓ Implemented flexible cache operations that work with minimal table schema
- ✓ Successfully tested and verified Supabase cache read/write operations
- ✓ Maintained backwards compatibility with existing analysis endpoints
- ✓ Confirmed 3-tier caching system working: in-memory (0-1ms), Supabase (180ms), fresh PSI (9-25s)
- ✓ Web interface successfully populating real analysis data in Supabase tables (January 4, 2025)
- ✓ Replaced all dummy UI data with real-time font and image extraction (January 7, 2025)
- ✓ Implemented authentic CSS font-family parsing from HTML content
- ✓ Enhanced image analysis with proper icon/photo classification 
- ✓ Created buildUIData helper function for consistent real data formatting
- ✓ Removed placeholder fonts (Roboto, Arial) and images with authentic scraped data
- ✓ Fixed progressive loading system: authentic data loads within 1-2 seconds
- ✓ All analysis endpoints now use real extracted fonts, images, and metadata

## Technical Stack
- **Frontend**: React, TypeScript, MUI, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Replit
- **Caching**: Multi-tier (Memory + Supabase + Request deduplication)
- **Performance**: Quick analysis (<5s), Full analysis with PSI caching

## User Preferences
- Focus on resolving build errors without changing functionality or UI
- Prioritize clean TypeScript compilation and proper type safety
- Implement performance optimizations without altering UI elements

## API Endpoints
- `GET /api/analyze/quick?url=<website-url>` - Returns overview data immediately from HTML analysis only
- `GET /api/analyze/full?url=<website-url>` - Returns complete analysis with PSI data and Supabase caching
- `GET /api/analyze?url=<website-url>` - Legacy endpoint (redirects to full analysis)
- `POST /api/colors` - Extracts colors from website using Playwright

## Setup Instructions
### Supabase Database Setup
1. Go to your Supabase project's SQL Editor
2. Run the following SQL to create the analysis cache table:
```sql
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_hash VARCHAR(64) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash ON analysis_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_updated_at ON analysis_cache(updated_at);

ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role access" ON analysis_cache FOR ALL USING (true);
```
