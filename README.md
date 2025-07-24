# Website Analysis Tool

## Project info

A comprehensive website analysis platform that transforms complex technical insights into actionable, user-friendly information. The application provides authentic website analysis using advanced browser automation, Lighthouse performance audits, and real-time accessibility testing with axe-core integration.

## Architecture Overview

### Frontend Components Using Playwright Data

The following React components integrate with Playwright-powered content analysis:

**Content Analysis Tab** (`client/src/components/dashboard/ContentAnalysisTab.tsx`)
- Real word count extraction from main article content using @mozilla/readability
- Flesch-Kincaid readability scoring based on authentic text analysis
- Text content visualization using actual scraped word counts instead of estimates

**Image Analysis Card** (`client/src/components/dashboard/ui-analysis/ImageAnalysisCard.tsx`)
- Enhanced image classification using 32×32 pixel area threshold (area > 1024px² = photo, else icon)
- Real photo/icon URLs from browser DOM inspection
- Authentic image metadata extraction replacing estimation algorithms

**Export Functionality** (`client/src/lib/exportUtils.ts`)
- PDF reports with authentic content metrics
- Real readability scores and word counts in exported analysis
- Accurate photo/icon classification data in reports

### Streamlined Analysis Architecture

The application uses a unified analysis system with progressive section loading:

1. **Main Analysis** (`/api/analyze/full`) - Comprehensive website analysis with PageSpeed Insights data
2. **Specialized Endpoints** for enhanced data:
   - `/api/seo` - Playwright extraction + Lighthouse SEO audits (blended scoring)
   - `/api/tech` - Enhanced tech detection (lightweight + Lighthouse best practices)
   - `/api/colors` - Real color extraction with axe-core accessibility analysis
   - `/api/fonts` - Authentic font extraction from rendered websites
   - `/api/lighthouse/*` - Direct Lighthouse performance, SEO, and best practices data

3. **Optimized Loading Experience**:
   - **Section-level loading indicators** - Each dashboard section shows loading state independently
   - **Intelligent caching** - 30-minute in-memory + 24-hour Supabase cache for sub-second cached responses
   - **Parallel processing** - HTML analysis, PSI data, and SEO extraction run simultaneously

4. **Intelligent Caching Strategy**:
   - **In-memory cache** (30 minutes) for ultra-fast repeated requests
   - **Supabase cache** (24 hours) for persistent data storage
   - **Request deduplication** to prevent duplicate API calls

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

* Navigate to the desired file(s).
* Click the "Edit" button (pencil icon) at the top right of the file view.
* Make your changes and commit the changes.

**Use GitHub Codespaces**

* Navigate to the main page of your repository.
* Click on the "Code" button (green button) near the top right.
* Select the "Codespaces" tab.
* Click on "New codespace" to launch a new Codespace environment.
* Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

### Frontend
* **React 18** with TypeScript for component architecture
* **Material-UI (MUI)** for responsive component library
* **Framer Motion** for smooth animations and transitions
* **Vite** for fast development and build tooling

### Backend & Analysis Engine
* **Express.js** server with TypeScript for robust API architecture
* **Lighthouse** for comprehensive performance, SEO, and best practices analysis (replacing PageSpeed Insights)
* **Playwright** for headless browser automation and content extraction
* **axe-core** for real-time accessibility testing and contrast analysis
* **@mozilla/readability** for authentic article content parsing
* **jsdom** for server-side DOM manipulation and analysis
* **Enhanced Tech Detection** combining lightweight HTTP analysis with Lighthouse data

### Content Analysis Pipeline
* **Real-time scraping**: Playwright extracts fonts, images, and text content
* **Content classification**: 32×32 pixel threshold for photo vs icon detection  
* **Readability analysis**: Flesch-Kincaid scoring on extracted article text
* **Progressive loading**: Quick analysis followed by enhanced Playwright data

### Data Storage & Performance
* **Supabase** (PostgreSQL) for analysis caching with 24-hour TTL
* **Multi-tier caching**: In-memory (30min) + Database (24hr) + Request deduplication
* **Drizzle ORM** for type-safe database operations
* **Express.js** API architecture with specialized analysis endpoints

*For a complete list of all frameworks and libraries (including package names and versions), see [docs/TECH\_STACK.md](docs/TECH_STACK.md).*

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

### Lightweight Pattern-Based Detection
* **Real-time HTTP analysis** for immediate technology identification
* **Pattern matching** for JavaScript frameworks (React, Vue, Angular, Next.js, Nuxt.js, Svelte, D3.js)
* **Security headers analysis** (CSP, HSTS, X-Frame-Options, etc.)
* **Minification detection** using content analysis patterns
* **Social platform integration** (Open Graph, Twitter Cards, analytics tracking)

### Lighthouse Best Practices Integration
* **HTTP/2 usage detection**
* **Text compression analysis**
* **Image optimization assessment**
* **WebP image format usage**
* **Responsive image implementation**
* **Security vulnerability scanning**

### Fallback Architecture
When comprehensive Lighthouse analysis fails, the system gracefully falls back to lightweight detection, ensuring users always receive authentic technical data rather than placeholder values.

## Supabase Setup

Copy `.env.example` to `.env` in the project root and fill in your Supabase credentials. The required environment variables are:

```sh
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PSI_API_KEY=<your-google-psi-key>
```

* `VITE_SUPABASE_URL`: Your Supabase project URL
* `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side operations
* `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations (optional)
* `PSI_API_KEY`: Google PageSpeed Insights API key (legacy support, Lighthouse is primary)

To enable color palette extraction with `node-vibrant`, install the optional dependency pinned to version `^4.0.3`:

```sh
npm install node-vibrant@^4
```

The library now includes its own TypeScript definitions.

## How can I deploy this project?

Deploy using your preferred hosting platform that supports Node.js applications.

## Continuous Integration and Testing

Automated tests cover the analysis utilities, export functions and UI helpers.
Every pull request runs these tests via GitHub Actions using the workflow at
`.github/workflows/ci.yml`.

Run tests locally with:

```sh
npm test
```

## Manual UI Review

For changes that affect the dashboard, follow the
[Manual UI Review Checklist](docs/Manual_UI_Checklist.md). It walks through
loading the app locally, verifying each tab, testing export features and checking
responsive layout.

// Run your usual "lint" and "tsc --noEmit" commands.
// All remaining errors should be unrelated to colour extraction.
