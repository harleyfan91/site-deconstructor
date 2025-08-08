# Site Deconstructor

A comprehensive web application analysis tool that performs deep technical audits including tech stack detection, color palette extraction, SEO analysis, performance metrics, and accessibility testing.

## Database Schema

We use Supabase (PostgreSQL) with the following tables to manage scan requests, progress tracking, and cached results:

### Core Tables
- **scans** – Master record of scan requests (URL, user ID, timestamps, active status)
- **scan_status** – Real-time status & progress tracking for each scan (queued/running/complete/failed)  
- **analysis_cache** – Cached audit results keyed by URL hash with expiration timestamps
- **scan_tasks** – Individual task breakdown for each scan type
- **users** – User management via Supabase Auth

### Key Features
- UUID primary keys on all tables for scalability
- Real-time progress updates via Supabase realtime subscriptions
- 24-hour TTL caching system in `analysis_cache` table
- Row Level Security (RLS) for user data isolation
- JSONB storage for flexible analysis result structures

See [`docs/SUPABASE_SCHEMA.md`](docs/SUPABASE_SCHEMA.md) for complete column definitions, data types, and relationship details.

## Technical Stack

**Frontend**: React 18, TypeScript, Material-UI, Framer Motion  
**Backend**: Node.js, Express.js, Drizzle ORM  
**Database**: Supabase (PostgreSQL) with real-time capabilities  
**Analysis**: Playwright, Lighthouse, axe-core accessibility testing  
**Build Tool**: Vite with TypeScript compilation  
**Deployment**: Replit with production-ready configuration  

### Advanced Analysis Capabilities

**SEO Analysis** - Blended scoring system combining:
- Playwright-based meta tag extraction and keyword analysis (60% weight)
- Lighthouse SEO audit scores and recommendations (40% weight)
- Real sitemap.xml and robots.txt validation

**Accessibility Testing** - Integrated axe-core analysis:
- Real contrast ratio calculations from rendered websites
- WCAG compliance checking with actionable recommendations
- Color accessibility warnings with suggested improvements

**Performance Analysis** - Lighthouse-powered metrics:
- Core Web Vitals (LCP, FID, CLS) from real user scenarios
- Performance optimization opportunities
- Best practices compliance with security assessments

## Enhanced Technical Analysis

The application features a sophisticated **Enhanced Tech Analysis** system that combines multiple data sources for comprehensive technology detection:

- **Framework Detection**: React, Vue, Angular, Next.js, Nuxt.js patterns
- **Build Tools**: Webpack, Vite, Parcel, Rollup identification  
- **Backend Technologies**: Node.js, PHP, Python, Ruby detection
- **CMS & E-commerce**: WordPress, Shopify, WooCommerce analysis
- **Performance Libraries**: Intersection Observer, Service Workers
- **Analytics & Marketing**: Google Analytics, Facebook Pixel, tracking scripts

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account with project configured
- Google PageSpeed Insights API key (optional, legacy support)

### Environment Setup

Copy `.env.example` to `.env` in the project root and configure your credentials:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PSI_API_KEY=<your-google-psi-key>
```

**Environment Variables:**
* `VITE_SUPABASE_URL`: Your Supabase project URL
* `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side operations
* `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations
* `PSI_API_KEY`: Google PageSpeed Insights API key (legacy support, Lighthouse is primary)

### Installation & Development

```bash
# Install dependencies
npm install

# Optional: Install color palette extraction (pinned version)
npm install node-vibrant@^4

# Start development environment (both client and server)
npm run dev

# Start with worker for full analysis pipeline
npm run worker:dev
```

The application will be available at `http://localhost:5173` (client) with the API server running on `http://localhost:5000`.

### Database Migration

The application uses Drizzle ORM for database management:

```bash
# Apply database migrations to Supabase
npm run migrate:supabase

# Generate new migrations (if schema changes)
npm run generate:migration
```

### Optional Dependencies

To enable color palette extraction with `node-vibrant`, install the optional dependency pinned to version `^4.0.3`:

```sh
npm install node-vibrant@^4
```

The library now includes its own TypeScript definitions.

## How can I deploy this project?

Deploy using Replit's deployment system which supports Node.js applications with built-in PostgreSQL database integration.

## Continuous Integration and Testing

Automated tests cover the analysis utilities, export functions and UI helpers.
Every pull request runs these tests via GitHub Actions using the workflow at
`.github/workflows/ci.yml`.

Run tests locally with one of the following commands:

```bash
# Unit tests with coverage
npm run test:unit

# End-to-end tests with Playwright
npm run test:e2e

# Run both sets of tests
npm test

# Playwright debug logs can be inspected via the DEBUG environment variable.
# The provided script already sets `DEBUG=pw:api,pw:browser*` by default.
```

## Database Management

### Verification

```bash
npm run migrate:supabase
npm run generate:migration
npx tsx clear-supabase.ts
psql "$DATABASE_URL" -c \
  "SELECT table_name FROM information_schema.tables \
   WHERE table_schema='public' AND table_name IN ('scans','scan_status','analysis_cache','scan_tasks','users');"
```

### Monitor Database
View current scan records:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM scans;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM analysis_cache;"
```

