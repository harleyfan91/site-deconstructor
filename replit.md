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

## Technical Stack
- **Frontend**: React, TypeScript, MUI, Framer Motion
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite
- **Deployment**: Replit

## User Preferences
- No specific user preferences recorded yet

## API Endpoints
- `GET /api/analyze?url=<website-url>` - Analyzes a website and returns comprehensive analysis data