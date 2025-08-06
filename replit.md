# Website Analysis Tool

## Overview
A comprehensive website analysis tool that provides insights into performance, SEO, accessibility, and design elements. The application aims to provide real-time website analysis with detailed reporting and export functionality, migrating successfully to a Replit environment with PostgreSQL database integration.

## User Preferences
- Focus on resolving build errors without changing functionality or UI
- Prioritize clean TypeScript compilation and proper type safety
- Implement performance optimizations without altering UI elements

## System Architecture
The application uses a React 18 frontend with TypeScript and Material-UI for components. Framer Motion handles animations, and React Router manages navigation. The backend is an Express.js server interacting with a PostgreSQL database via Drizzle ORM. Key features include server-side website analysis with color extraction, mobile responsiveness checks, security analysis, and a unified analysis endpoint (`/api/overview` and `POST /api/scan`). The system employs a multi-tier caching strategy (in-memory, database, and request deduplication) and progressive loading for an immediate user experience followed by detailed analysis. Core architectural decisions include:
- **UI/UX:** Material-UI for consistent theming, Framer Motion for smooth animations, and a focus on clean, consistent layouts across dashboard tabs. Design elements prioritize readability and clear data presentation. A "fast-feeling" UX is achieved with instant navigation and polling, using skeleton loading components.
- **Technical Implementations:**
    - Frontend: React 18, TypeScript, Material-UI, Framer Motion, Swiper, React Router.
    - Backend: Node.js, Express.js, PostgreSQL with Drizzle ORM, Playwright for browser automation, `@mozilla/readability` for content analysis, `axe-core` for accessibility testing.
    - Real-time website analysis includes detailed reporting on performance (Lighthouse), SEO (meta tags, keywords, heading hierarchy), accessibility (contrast, violations), and UI elements (color extraction, font analysis, image classification).
    - Tech stack detection is implemented via custom Playwright-based patterns, replacing deprecated Wappalyzer.
    - Authentication system with Login/Logout components, JWT token injection, server-side verification, and Row Level Security (RLS) for multi-tenant security.
- **System Design Choices:**
    - **Unified API:** A single-network-call architecture where a call to `/api/overview` or `/api/scan` provides all dashboard data, replacing scattered API calls.
    - **Queue-based Processing:** Background worker system with continuous polling for queued tasks (tech, colors, SEO, performance analysis) to manage resource-intensive operations.
    - **Caching:** Multi-tier caching (in-memory, Supabase database, and request deduplication) with cache invalidation for stale data.
    - **Progressive Loading:** Immediate display of basic information while detailed analysis loads in the background, providing a responsive user experience.
    - **Optimized Playwright Usage:** Single-browser-context optimization significantly reduces analysis time by reusing existing page contexts instead of launching new browsers for each task.
    - **Database Refactor:** Comprehensive 7-part database refactor for robust schema, migrations, optimistic `POST /scans`, worker and task fan-out, React-Query hooks, local storage panel-state, and real-time progress subscriptions.
    - **Modularity:** UI components are presentational, receiving data via props from unified endpoints.

## External Dependencies
- **Database:** Supabase (PostgreSQL)
- **Browser Automation:** Playwright
- **Accessibility Testing:** axe-core
- **Content Analysis:** @mozilla/readability
- **UI Components:** Material-UI (MUI)
- **Animations:** Framer Motion
- **Carousel:** Swiper
- **ORM:** Drizzle ORM
- **State Management/Data Fetching:** React-Query
- **UI Libraries:** Radix UI