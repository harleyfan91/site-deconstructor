# Playwright Integration Documentation

## Overview

This document details how Playwright is integrated into the website analysis tool to provide authentic content extraction and analysis capabilities.

## Architecture

### Backend Implementation

**Server Components**
- `server/lib/page-scraper.ts` - Main Playwright integration module
- `server/routes.ts` - API endpoints utilizing Playwright data
- Enhanced analysis endpoints for content extraction

**Key Functions**
- `extractContentAnalysis()` - Uses @mozilla/readability for article parsing
- `extractImagesFromPage()` - Enhanced image classification with 32×32 pixel threshold
- `calculateFleschKincaidScore()` - Readability scoring algorithm

### Frontend Integration

**Components Consuming Playwright Data**

1. **ContentAnalysisTab** (`client/src/components/dashboard/ContentAnalysisTab.tsx`)
   ```typescript
   // Real data extraction
   const contentData = data.data?.content;
   const readabilityScore = contentData?.readabilityScore === "!" ? 0 : (contentData?.readabilityScore || 0);
   const wordCount = contentData?.wordCount === "!" ? 0 : (contentData?.wordCount || 0);
   ```
   - Displays authentic word counts from extracted article content
   - Shows Flesch-Kincaid readability scores based on real text analysis
   - Uses fallback markers ("!") while Playwright data is loading

2. **ImageAnalysisCard** (`client/src/components/dashboard/ui-analysis/ImageAnalysisCard.tsx`)
   ```typescript
   // Enhanced classification data
   const photoUrls = imageAnalysis?.photoUrls || [];
   const iconUrls = imageAnalysis?.iconUrls || [];
   ```
   - Displays real photo URLs (area > 32×32 pixels)
   - Shows authentic icon URLs (area ≤ 32×32 pixels)
   - Replaces estimation algorithms with browser-extracted metadata

3. **Export Functionality** (`client/src/lib/exportUtils.ts`)
   - PDF reports include authentic content metrics
   - Real readability scores and word counts in exported analysis
   - Accurate photo/icon classification data

## Data Flow

### Progressive Loading System

```
User Request → Quick Analysis (immediate) → Enhanced Analysis (Playwright)
     ↓                ↓                           ↓
Frontend      Fallback markers ("!")     Real scraped data
```

1. **Quick Analysis** (`/api/analyze/quick`)
   - Returns immediate overview data
   - Uses fallback markers ("!") for content pending Playwright analysis
   - Loads within 1-2 seconds

2. **Enhanced Analysis** (`/api/analyze/content`)
   - Playwright browser automation extracts real content
   - @mozilla/readability parses article content for word counting
   - Enhanced image classification based on pixel dimensions
   - Flesch-Kincaid readability scoring on extracted text

### Loading States

Frontend components handle three data states:
- **Loading**: Shows CircularProgress indicators
- **Fallback**: Displays "!" markers while Playwright processes
- **Complete**: Shows authentic scraped data

## Image Classification Algorithm

### Enhanced 32×32 Pixel Threshold

```typescript
// Playwright-based classification
const area = width * height;
const isIcon = area <= (32 * 32) || width <= 32 || height <= 32 || hasIconKeywords;
const isPhoto = !isIcon;
```

**Classification Logic:**
- **Icons**: Area ≤ 1,024 pixels OR any dimension ≤ 32px OR contains icon keywords
- **Photos**: All other images (area > 1,024 pixels AND both dimensions > 32px)

This replaces previous estimation algorithms with real browser-measured dimensions.

## Content Analysis Pipeline

### Article Extraction Process

1. **Page Loading**: Playwright navigates to target URL
2. **DOM Extraction**: Full HTML content retrieved
3. **Readability Processing**: @mozilla/readability extracts main article content
4. **Word Counting**: Authentic word count from extracted text
5. **Readability Scoring**: Flesch-Kincaid algorithm applied to real content

### Readability Calculation

```typescript
function calculateFleschKincaidScore(text: string): number {
  // Count sentences, words, and syllables from real content
  const avgSentenceLength = wordCount / sentences;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(fleschScore)));
}
```

## API Endpoints

### Content Analysis Endpoint

**POST /api/analyze/content**
```json
{
  "ui": {
    "imageAnalysis": {
      "photoUrls": ["https://example.com/photo1.jpg"],
      "iconUrls": ["https://example.com/icon1.svg"]
    }
  },
  "content": {
    "wordCount": 1250,
    "readabilityScore": 78
  }
}
```

### Integration with Existing Endpoints

- **Quick Analysis**: Includes content data with fallback markers
- **Full Analysis**: Merges Playwright data with PSI performance metrics
- **Color Extraction**: Already using Playwright for color analysis

## Performance Considerations

### Caching Strategy

- **Supabase Cache**: 24-hour TTL for Playwright-extracted data
- **In-Memory Cache**: 30-minute TTL for frequent requests
- **Request Deduplication**: Prevents concurrent Playwright sessions

### Browser Management

- **Global Browser Instance**: Reused across requests for efficiency
- **Context Isolation**: Each analysis uses separate browser context
- **Resource Cleanup**: Contexts closed after extraction completion

## Development Notes

### Environment Setup

Playwright requires system-level browser dependencies:
```bash
# Install Playwright browsers
npx playwright install chromium

# Or use system chromium (Replit environment)
executablePath: '/usr/bin/chromium'
```

### Error Handling

Components gracefully handle Playwright failures:
- Fallback to estimation algorithms when Playwright unavailable
- Error states displayed in UI components
- Logging for debugging browser automation issues

## Future Enhancements

### Planned Improvements

1. **Real-time Updates**: WebSocket integration for live content analysis updates
2. **Extended Metrics**: Additional content quality measurements
3. **Batch Processing**: Multiple URL analysis with optimized browser usage
4. **Mobile Analysis**: Responsive design testing with device emulation

### Browser Compatibility

Currently supports Chromium-based analysis with plans for:
- Firefox integration for cross-browser comparison
- Mobile device emulation for responsive analysis
- Accessibility testing automation