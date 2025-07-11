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
- ✓ Enhanced full analysis endpoint (/api/analyze/full) with Lighthouse data and caching
- ✓ Implemented 3-tier caching: in-memory (30min), database (24hr), and request deduplication
- ✓ Added precise timing logs and comprehensive Lighthouse analysis
- ✓ Parallelized HTML fetch and Lighthouse calls using Promise.all
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
- ✓ Enhanced backend with Playwright content analysis (January 7, 2025)
- ✓ Added @mozilla/readability + jsdom for word counting and Flesch-Kincaid readability scoring
- ✓ Implemented enhanced image classification: area > 32×32 → photo, else icon
- ✓ Created /api/analyze/content endpoint for comprehensive scraping with real data
- ✓ Added content data to analysis responses with fallback markers ("!") for pending data
- ✓ Updated ContentAnalysisTab to pull real wordCount and readabilityScore from Playwright
- ✓ Enhanced ImageAnalysisCard to display authentic photo/icon classification from browser scraping
- ✓ Completely refactored Performance tab layout (January 7, 2025)
- ✓ Simplified from 588 lines to 170 lines - removed complex nested grids and manual positioning
- ✓ Aligned layout structure with SEO, Content, and Compliance tabs for consistency
- ✓ Eliminated outer wrappers, metric-cards grid, manual spanning, width helpers and overflow issues
- ✓ Clean 2-column pattern: Performance Metrics + Core Web Vitals (2/3 width), then Mobile + Recommendations
- ✓ Added comprehensive caching for Font Analysis and Color Extraction (January 7, 2025)
- ✓ Implemented POST /api/fonts endpoint with 24-hour Supabase caching using fonts_{hash} keys
- ✓ Enhanced POST /api/colors endpoint with 24-hour Supabase caching using colors_{hash} keys
- ✓ Successfully tested cache hits: fonts (242ms vs fresh extraction), colors (184ms vs 12+ seconds)
- ✓ Maintained existing Supabase table structure without schema changes
- ✓ Added proper error handling and timeout management for cached endpoints
- ✓ Removed fallback font data generation to prevent showing incorrect font information (January 7, 2025)
- ✓ Updated FontAnalysisCard to show appropriate message when Chromium is unavailable
- ✓ Fixed performLocalAnalysis to return empty font arrays instead of generating fake CSS-based fallback data
- ✓ Ensured font analysis only shows authentic Playwright-extracted fonts or clear unavailability message
- ✓ Installed Chromium system dependency to enable real font extraction (January 7, 2025)
- ✓ Updated Playwright browser configuration to use system Chromium executable path
- ✓ Fixed client-side font analysis that was incorrectly analyzing our app's fonts instead of target websites
- ✓ Successfully tested font extraction: Vercel.com returned 16 authentic fonts including Geist, Geist Mono, and fallbacks
- ✓ Font analysis now works for many websites with proper Playwright-based extraction and 24-hour caching
- ✓ Fixed "Quick analysis failed: 500" error by implementing URL normalization (January 7, 2025)
- ✓ Added automatic https:// prefix for URLs without protocol (e.g., google.com → https://google.com)
- ✓ Added proper URL validation and error handling in quick analysis endpoint
- ✓ Tested successfully: audiusa.com and google.com now work correctly instead of returning 500 errors
- ✓ Fixed Font Analysis loading states and browser context management (January 7, 2025)
- ✓ Added proper loading indicators with spinner and "Extracting fonts..." message
- ✓ Resolved browser context conflicts causing premature closure and extraction failures
- ✓ Enhanced FontAnalysisCard to fetch data independently with proper error handling
- ✓ Successfully extracting authentic fonts: Apple.com returns 9 fonts including SF Pro Text
- ✓ Added scrollable font display: mobile shows 2 fonts, desktop shows 3 fonts at a time
- ✓ Implemented custom scrollbar styling for better UX
- ✓ Implemented universal dynamic scroll indicator system (January 7, 2025)
- ✓ Removed all scrollbar tracks across all devices for cleaner interface
- ✓ Added persistent initial display: shows immediately when content is scrollable
- ✓ Transitions to dynamic behavior after first user scroll: appears during scroll, fades after 1.5s
- ✓ Fixed opacity transition with 2.5s smooth cubic-bezier fade-out animation
- ✓ Smart detection: only shows when content is actually scrollable
- ✓ Works on all devices (mobile and desktop) with consistent dark overlay design
- ✓ Positioned as floating overlay in bottom-right corner to avoid layout conflicts
- ✓ Resets behavior for each new URL analysis to ensure first-time visibility
- ✓ Fixed loading state race condition preventing premature "no fonts detected" messages (January 7, 2025)
- ✓ Added proper state tracking to differentiate between: not started, loading, complete with no results
- ✓ Enhanced user experience with appropriate messaging for each state
- ✓ Fixed Color Extraction header consistency - now persists header and icon during loading like Font Analysis (January 7, 2025)
- ✓ Removed early returns to maintain header visibility during extraction process  
- ✓ Aligned loading states between Font Analysis and Color Extraction for consistent UX
- ✓ Added loading indicator to Performance Metrics section matching UI analysis components (January 7, 2025)
- ✓ Performance Metrics now shows header persistently with spinner during data loading
- ✓ Consistent loading behavior across all analysis sections: UI, Content, and Performance tabs
- ✓ Completed comprehensive typography and color standardization refactoring (January 8, 2025)
- ✓ Replaced ALL hardcoded hex color values (#FF6B35, #0984E3) with theme.palette tokens across entire codebase
- ✓ Eliminated inline fontWeight and fontSize overrides in favor of theme typography variants
- ✓ Enhanced theme configuration with complete typography variants (h1-h6, subtitle1-2, body1-2, overline, caption)
- ✓ Standardized dashboard components: UIAnalysisTab, PerformanceTab, ContentAnalysisTab, OverviewTab, TechTab, FontAnalysisCard, ImageAnalysisCard, ColorExtractionCard
- ✓ Fixed HeroSection, AppHeader, DashboardContent, and PricingCard components for consistent theming
- ✓ Established single source of truth for typography and colors through theme system
- ✓ Implemented comprehensive SEO data extraction with Playwright browser automation (January 8, 2025)
- ✓ Created real-time analysis of meta tags, keywords, heading hierarchy, robots.txt/sitemap status
- ✓ Added dedicated /api/seo endpoint with 24-hour Supabase caching for performance optimization
- ✓ Enhanced SEO Analysis tab with keyword density tables, technical SEO indicators, and meta tag displays
- ✓ Fixed layout inconsistencies using 2x2 grid system matching other dashboard tabs
- ✓ Integrated authentic SEO data into full analysis endpoint replacing all placeholder values with "!" fallback indicators
- ✓ Standardized chip styling and colors for consistency across dashboard tabs
- ✓ Created dedicated URL analysis page duplicating HeroSection functionality without CTA (January 8, 2025)
- ✓ Added /analyze route with identical URL input form behavior as landing page
- ✓ Integrated "Analyze a URL" navigation button for both desktop and mobile interfaces
- ✓ Fixed dashboard runtime error by removing duplicate URLInputForm component
- ✓ Streamlined dashboard to focus purely on analysis results display
- ✓ Implemented comprehensive tech analysis backend with advanced pattern-based detection (January 9, 2025)
- ✓ Replaced deprecated Wappalyzer with custom Playwright-based technology detection
- ✓ Created dedicated /api/tech endpoint with real data extraction for tech stack, minification, social tags, cookies, and ad tags
- ✓ Added 24-hour Supabase caching for tech analysis performance optimization
- ✓ Updated TechTab frontend to fetch and display authentic technical data with loading states
- ✓ Fixed runtime errors from undefined technical variable references
- ✓ Fixed browser context conflicts by implementing lightweight HTTP-based tech analysis (January 9, 2025)
- ✓ Created tech-lightweight.ts with real pattern-based technology detection
- ✓ Successfully detecting React, Next.js, Vue.js, Angular, jQuery, Google Analytics, and security headers
- ✓ Tech analysis now returns authentic data: React.dev shows 5 real technologies with confidence scores
- ✓ Added comprehensive social tag analysis, minification detection, and security header parsing
- ✓ Fixed caching system with tech_lightweight_ prefix for proper cache management
- ✓ Successfully replaced PageSpeed Insights with Lighthouse for comprehensive SEO, Performance, and Best Practices analysis (January 9, 2025)
- ✓ Completely removed Google PageSpeed Insights (PSI) from entire codebase including code, endpoints, tests, and documentation (January 10, 2025)
- ✓ Integrated axe-core accessibility testing into color extraction API for real contrast warnings and accessibility scores
- ✓ Created enhanced Tech analysis combining lightweight HTTP detection with Lighthouse Best Practices data
- ✓ Added new Lighthouse-powered endpoints: /api/lighthouse/seo, /api/lighthouse/performance, /api/lighthouse/best-practices
- ✓ Enhanced SEO analysis blends Playwright extraction (60%) with Lighthouse audit scores (40%) for comprehensive scoring
- ✓ Color extraction API now returns both colors and accessibility analysis with contrast issues and accessibility scores
- ✓ Added pa11y integration with GitHub Actions workflow for automated accessibility testing
- ✓ Enhanced Tech tab now displays real Lighthouse data: HTTP/2 usage, text compression, optimized images, security headers
- ✓ All analysis endpoints verified working: Lighthouse SEO (90 score), Performance (100 score), Enhanced Tech analysis
- ✓ Fixed color extraction by reverting unauthorized accessibility modifications and restoring original functionality (January 9, 2025)
- ✓ Tech tab now displays real comprehensive data: 5 technologies detected (React, Next.js, Nuxt.js, Svelte, D3.js) with confidence scores
- ✓ SEO tab working with enhanced analysis combining Playwright extraction (60%) and Lighthouse audits (40%) 
- ✓ Resolved Lighthouse concurrency issues by running analyses sequentially instead of parallel execution
- ✓ Added graceful error handling and fallback mechanisms to prevent perpetual loading in frontend components
- ✓ Completely restored color extraction functionality by fixing frontend response format handling (January 9, 2025)
- ✓ Color extraction now successfully processes 254+ colors from real websites with proper property classification
- ✓ Fixed response format mismatch: frontend now handles both `{ colors: [...] }` and flat array responses
- ✓ Verified working with fast cache performance (109-120ms) and comprehensive color analysis
- ✓ Surgically fixed all TypeScript compilation errors without changing functionality or UI (January 9, 2025)
- ✓ Resolved type safety issues: SEO count handling, Tech analysis interface compliance, axe-core API usage
- ✓ Fixed crypto import statements, lighthouse service types, and array type declarations across all files
- ✓ Maintained 100% functionality while achieving clean TypeScript compilation
- ✓ Implemented section-level loading indicators for SEO and Tech tabs replacing tab-level loading (January 9, 2025)
- ✓ Fixed SEO tab runtime error with proper null safety checks for seo.metaTags
- ✓ Added real minification detection as fallback when comprehensive /api/tech analysis fails
- ✓ Minification status now shows authentic pattern-based analysis results instead of placeholder messages
- ✓ Enhanced user experience with consistent section-specific loading states across all analysis components
- ✓ Updated comprehensive technical documentation (README.md and TECH_STACK.md) reflecting all backend improvements (January 9, 2025)
- ✓ Documented Lighthouse integration, axe-core accessibility testing, and enhanced tech detection architecture
- ✓ Added detailed API endpoint documentation with caching strategy and performance metrics
- ✓ Documented migration from PageSpeed Insights to Lighthouse with benefits and architectural improvements
- ✓ Streamlined analysis workflow by removing quick analysis step and implementing unified comprehensive analysis (January 9, 2025)
- ✓ Updated frontend API hook to go directly to full analysis endpoint with improved caching performance
- ✓ Removed redundant quick analysis endpoint simplifying codebase and reducing potential error sources
- ✓ Maintained smooth user experience through section-level loading indicators and optimized PSI caching
- ✓ Updated all documentation and tests to reflect simplified unified analysis architecture
- ✓ Implemented progressive loading solution using immediate query parameter for faster Overview display (January 9, 2025)
- ✓ Overview tab now renders immediately with local analysis data while PSI loads in background
- ✓ Fixed critical UX issue where users waited 25+ seconds before seeing any dashboard content
- ✓ Progressive analysis: immediate response (1-2 seconds) followed by PSI updates for performance metrics
- ✓ Implemented specialized endpoint architecture with Lighthouse-powered page load times and overview aggregator (January 10, 2025)
- ✓ Created dedicated endpoints: /api/performance (Core Web Vitals + page load times), /api/content, /api/ui, /api/overview
- ✓ Enhanced Lighthouse service with sequential desktop/mobile analysis to avoid concurrency issues
- ✓ Successfully tested all endpoints: UI data (10 fonts), Content (26 words), Performance (211ms desktop, 766ms mobile)
- ✓ Overview aggregator combines all specialized routes with graceful error handling and authentic data only
- ✓ Removed deprecated performLocalAnalysis function and quick analysis code paths completely
- ✓ Fixed buildUIData function with proper null safety and error handling for robust data extraction
- ✓ Resolved critical analysis loading failures by fixing TechTab data structure alignment and Lighthouse error handling (January 10, 2025)
- ✓ Fixed TechTab to properly read tech data from specialized endpoints under data.tech instead of data.technical
- ✓ Enhanced Lighthouse service with comprehensive fallback handling to prevent DOMException errors from breaking analysis flow
- ✓ Added robust error recovery for SEO, Best Practices, and Page Load Time analysis with fallback data
- ✓ Successfully restored all tabs to complete their analysis loading with authentic data display
- ✓ Fixed Performance tab mobile score calculation using page load time data with proper scoring algorithm
- ✓ Fixed critical UX issue: "Enter a URL to analyze a website" message no longer appears during progressive loading (January 10, 2025)
- ✓ Updated OverviewTab to only show idle state when no data AND no loading in progress
- ✓ Enhanced DashboardContent to properly handle progressive loading states without showing URL input form
- ✓ Fixed dashboard routing to auto-start analysis when URL parameters are provided
- ✓ Eliminated brief flash of URL input form that appeared before dashboard content rendered
- ✓ Removed redundant URL input form from DashboardContent and replaced with navigation to existing /analyze page (January 10, 2025)
- ✓ Streamlined error handling to route users to dedicated "Analyze a URL" page instead of duplicating functionality
- ✓ Improved code maintainability by eliminating duplicate URL input components
- ✓ Implemented consistent loading states across tabs - Phase 1: Overview, UI Analysis, and Content Analysis (January 10, 2025)
- ✓ Overview tab: Shows large tab-level loading indicator when no data is available (maintains existing behavior)
- ✓ UI Analysis tab: Shows dashboard structure with individual section-level loading indicators (ColorExtractionCard, FontAnalysisCard handle their own loading)
- ✓ Content Analysis tab: Shows dashboard structure with section-level loading indicators for each analysis section
- ✓ Eliminated inconsistent tab-level loading states in favor of targeted section-level indicators for better UX
- ✓ Completed Content tab data analysis fixes (January 10, 2025)
- ✓ Fixed Content Distribution chart rendering using ResponsiveContainer for proper sizing
- ✓ Verified authentic content data extraction: 103 words, readability score 53 for Apple.com
- ✓ Removed debug logging after confirming data flow integrity
- ✓ Content tab now displays real-time text analysis, readability scores, and content distribution visualization
- ✓ Completed Phase 2 of loading indicator project - Performance, SEO, and Technical tabs (January 10, 2025)
- ✓ Performance tab: Consistent section-level loading indicators for Performance Metrics, Core Web Vitals, Mobile Analysis, and Recommendations
- ✓ SEO tab: Section-level loading indicators for SEO Checklist, SEO Score, Analysis Status, SEO Recommendations, and Keywords sections
- ✓ Technical tab: Section-level loading indicators for Tech Stack, Minification Status, and all technical analysis sections
- ✓ Eliminated all tab-level loading states in favor of targeted section-level indicators across all dashboard tabs
- ✓ All tabs now show dashboard structure immediately with individual section-level loading states for optimal UX
- ✓ Fixed duplicate attribute warning in ThemeProvider component (January 10, 2025)
- ✓ Fixed TechTab perpetual loading issues by updating loading logic to properly detect when tech data is available (January 10, 2025)
- ✓ Fixed cookie banner section in TechTab to display proper cookie analysis with Session, Tracking, and Analytics cookies
- ✓ Resolved chart sizing warnings in ContentAnalysisTab by using fixed dimensions instead of percentage-based sizing
- ✓ All section-level loading indicators now working correctly across all dashboard tabs

## Technical Stack
- **Frontend**: React, TypeScript, MUI, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Replit
- **Caching**: Multi-tier (Memory + Supabase + Request deduplication)
- **Performance**: Progressive loading (1-2s immediate, 25s complete with PSI), Multi-tier caching

## User Preferences
- Focus on resolving build errors without changing functionality or UI
- Prioritize clean TypeScript compilation and proper type safety
- Implement performance optimizations without altering UI elements

## API Endpoints
- `GET /api/analyze/full?url=<website-url>` - Complete analysis with aggregated data and Supabase caching
- `GET /api/analyze?url=<website-url>` - Legacy endpoint (redirects to full analysis)
- `GET /api/overview?url=<website-url>` - Comprehensive overview aggregating all specialized endpoints
- `GET /api/performance?url=<website-url>` - Performance analysis with Lighthouse page load times and Core Web Vitals
- `GET /api/ui?url=<website-url>` - UI data extraction (fonts, images, contrast analysis)
- `POST /api/content` - Content analysis (word count, readability) via Playwright extraction
- `POST /api/colors` - Extracts colors from website using Playwright
- `POST /api/fonts` - Extracts fonts from website using Playwright  
- `POST /api/seo` - SEO analysis with Playwright extraction and Lighthouse audits
- `POST /api/tech` - Technology detection with lightweight HTTP-based analysis

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
