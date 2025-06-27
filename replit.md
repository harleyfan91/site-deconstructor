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
- ✓ Fixed TypeScript compilation errors in server/routes.ts color configuration types
- ✓ Implemented proper type safety for color category fallback properties
- ✓ Added color category selection dropdown to UI Analysis tab
- ✓ Integrated small settings button with seamless popover for category configuration
- ✓ Created API endpoints for color category management (/api/color-categories)

## Technical Stack
- **Frontend**: React, TypeScript, MUI, Framer Motion
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite
- **Deployment**: Replit

## User Preferences
- Focus on resolving build errors without changing functionality or UI
- Prioritize clean TypeScript compilation and proper type safety

## API Endpoints
- `GET /api/analyze?url=<website-url>` - Analyzes a website and returns comprehensive analysis data