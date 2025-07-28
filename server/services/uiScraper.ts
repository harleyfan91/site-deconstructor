/**
 * Unified UI Scraper Service
 * Consolidates color, font, accessibility, and image analysis into a single Playwright session
 */

import { chromium, Browser, Page } from 'playwright';
import { UIAnalysis, ColorResult, FontResult, ImageResult, ContrastIssue, AccessibilityViolation, ImageAnalysis } from '../../types/UIAnalysis';
import { unifiedCache } from '../lib/cache';
import { queuePlaywrightTask } from '../lib/queue';

// Import existing utilities
import { getAccessibilityAnalysis } from '../lib/axe-integration-new';
import { colord } from 'colord';
import colorNamer from 'color-namer';

const CURRENT_VERSION = '1.1.0';

/**
 * Check if Playwright should be disabled (for resource-constrained environments)
 */
const DISABLE_PLAYWRIGHT = process.env.DISABLE_PLAYWRIGHT === 'true' || process.env.NODE_ENV === 'test';

/**
 * Browser configuration for consistent scraping (optimized for Replit)
 */
const BROWSER_CONFIG = {
  headless: true,
  executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-background-timer-throttling',
    '--disable-background-networking',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-translate',
    '--disable-plugins',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-client-side-phishing-detection',
    '--disable-component-extensions-with-background-pages',
    '--disable-ipc-flooding-protection',
    '--memory-pressure-off',
    '--max_old_space_size=512',
    '--single-process'
  ]
};

/**
 * Extract colors from the current page context (no new browser launch)
 */
async function extractColorsFromPage(page: Page, url: string): Promise<ColorResult[]> {
  console.log('🎨 Extracting colors from current page context...');
  
  return page.evaluate(() => {
    const colorMap = new Map<string, { property: string; count: number }>();
    
    // Get all elements and extract colors from computed styles
    const elements = Array.from(document.querySelectorAll('*'));
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const properties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
      
      properties.forEach(property => {
        const value = style.getPropertyValue(property);
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'initial' && value !== 'inherit') {
          // Convert to hex
          const div = document.createElement('div');
          div.style.color = value;
          document.body.appendChild(div);
          const computedColor = window.getComputedStyle(div).color;
          document.body.removeChild(div);
          
          if (computedColor && computedColor.startsWith('rgb')) {
            const hex = rgbToHex(computedColor);
            if (hex && hex !== '#000000' && hex !== '#ffffff') {
              const existing = colorMap.get(hex);
              if (existing) {
                existing.count++;
              } else {
                colorMap.set(hex, { property, count: 1 });
              }
            }
          }
        }
      });
    });
    
    // Convert RGB to HEX helper
    function rgbToHex(rgb: string): string {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }
      return '';
    }
    
    // Return color results
    return Array.from(colorMap.entries()).map(([hex, { property, count }]) => ({
      hex,
      property,
      occurrences: count,
      name: '' // Will be filled by color-namer on server side
    }));
  }).then(colors => {
    // Add human-readable names using color-namer
    return colors.map(color => ({
      ...color,
      name: colorNamer(color.hex).ntc[0]?.name || 'Unknown'
    })).slice(0, 100); // Limit to 100 colors for performance
  });
}

/**
 * Extract fonts from page using computed styles and CSS parsing
 */
async function extractFontsFromPage(page: Page): Promise<FontResult[]> {
  return page.evaluate(() => {
    const fonts = new Map<string, FontResult>();
    
    // Get all computed font families from elements
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const fontFamily = style.fontFamily;
      
      if (fontFamily && fontFamily !== 'inherit') {
        // Parse font family string
        const families = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
        
        families.forEach(family => {
          if (!fonts.has(family) && family !== 'inherit') {
            fonts.set(family, {
              name: family,
              category: family.includes('serif') ? 'serif' : family.includes('mono') ? 'monospace' : 'sans-serif',
              usage: element.tagName.toLowerCase(),
              fallbacks: families.slice(families.indexOf(family) + 1),
              weights: [parseInt(style.fontWeight) || 400],
              isSystemFont: ['Arial', 'Helvetica', 'Times', 'Georgia', 'Verdana'].includes(family)
            });
          }
        });
      }
    });

    // Also check CSS rules for @font-face declarations
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule instanceof CSSFontFaceRule) {
              const fontFamily = rule.style.fontFamily?.replace(/['"]/g, '');
              if (fontFamily && !fonts.has(fontFamily)) {
                fonts.set(fontFamily, {
                  name: fontFamily,
                  category: 'custom',
                  usage: 'font-face',
                  fallbacks: [],
                  weights: [],
                  isSystemFont: false
                });
              }
            }
          });
        } catch (e) {
          // Cross-origin or other CSS access issues
        }
      });
    } catch (e) {
      // StyleSheets access issues
    }

    return Array.from(fonts.values());
  });
}

/**
 * Extract images with detailed analysis
 */
async function extractImagesFromPage(page: Page): Promise<{ images: ImageResult[], analysis: ImageAnalysis }> {
  const imageData = await page.evaluate(() => {
    const images: any[] = [];
    const imgElements = document.querySelectorAll('img, picture source, [style*="background-image"]');
    
    imgElements.forEach((element, index) => {
      let src = '';
      let alt = '';
      let width = 0;
      let height = 0;

      if (element instanceof HTMLImageElement) {
        src = element.src;
        alt = element.alt || '';
        width = element.naturalWidth || element.width;
        height = element.naturalHeight || element.height;
      } else if (element instanceof HTMLSourceElement) {
        src = element.srcset?.split(' ')[0] || '';
      } else {
        // Background image
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          src = bgImage.replace(/url\(['"]?([^'"]*)['"]?\)/, '$1');
          const rect = element.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
        }
      }

      if (src && !src.startsWith('data:')) {
        // Classify image type based on dimensions
        const area = width * height;
        let type: 'photo' | 'icon' | 'logo' = 'icon';
        
        if (area > 32 * 32) {
          type = 'photo';
        }
        if (src.includes('logo') || alt.toLowerCase().includes('logo')) {
          type = 'logo';
        }

        images.push({
          url: src,
          alt,
          width,
          height,
          type,
          format: src.split('.').pop()?.toLowerCase() || 'unknown'
        });
      }
    });

    return images;
  });

  // Create analysis summary
  const photos = imageData.filter(img => img.type === 'photo');
  const icons = imageData.filter(img => img.type === 'icon');
  const withAlt = imageData.filter(img => img.alt && img.alt.trim().length > 0).length;
  const emptyAlt = imageData.filter(img => img.alt === '').length;
  const withoutAlt = imageData.length - withAlt - emptyAlt;

  const analysis: ImageAnalysis = {
    totalImages: imageData.length,
    estimatedPhotos: photos.length,
    estimatedIcons: icons.length,
    imageUrls: imageData.map(img => img.url),
    photoUrls: photos.map(img => img.url),
    iconUrls: icons.map(img => img.url),
    altStats: {
      withAlt,
      withoutAlt,
      emptyAlt,
      totalImages: imageData.length
    }
  };

  return { images: imageData, analysis };
}

/**
 * Unified UI scraper that consolidates all UI analysis in a single browser session
 */
export class UIScraperService {
  /**
   * Perform complete UI analysis for a URL
   */
  static async analyzeUI(url: string): Promise<UIAnalysis> {
    return unifiedCache.getOrCompute('ui_analysis', url, async () => {
      console.log(`🎨 Starting unified UI analysis for: ${url}`);
      const startTime = Date.now();
      
      // Check if Playwright is disabled
      if (DISABLE_PLAYWRIGHT) {
        console.log(`🔧 Playwright disabled, using fallback analysis for: ${url}`);
        return this.fallbackAnalysis(url, startTime);
      }

      // Try Playwright analysis first, fallback to lightweight analysis if it fails
      try {
        return await queuePlaywrightTask(url, async () => {
          let browser: Browser | null = null;
          try {
            // Launch browser with timeout
            const launchTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Browser launch timeout')), 15000)
            );
            
            browser = await Promise.race([
              chromium.launch(BROWSER_CONFIG),
              launchTimeout
            ]) as Browser;
            
            const context = await browser.newContext({
              viewport: { width: 1920, height: 1080 },
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            });
            const page = await context.newPage();

        // Navigate to page
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });
        await page.waitForTimeout(2000); // Let page settle

        // Run all extractions in parallel using the SAME browser context
        const [
          colorResults,
          fontResults,
          imageResults,
          accessibilityResults
        ] = await Promise.all([
          extractColorsFromPage(page, url).catch(err => {
            console.warn('Color extraction failed:', err.message);
            return [];
          }),
          extractFontsFromPage(page).catch(err => {
            console.warn('Font extraction failed:', err.message);
            return [];
          }),
          extractImagesFromPage(page).catch(err => {
            console.warn('Image extraction failed:', err.message);
            return { images: [], analysis: {
              totalImages: 0, estimatedPhotos: 0, estimatedIcons: 0,
              imageUrls: [], photoUrls: [], iconUrls: [],
              altStats: { withAlt: 0, withoutAlt: 0, emptyAlt: 0, totalImages: 0 }
            }};
          }),
          getAccessibilityAnalysis(page, url).catch(err => {
            console.warn('Accessibility analysis failed:', err.message);
            return { contrastIssues: [], violations: [], score: 0 };
          })
        ]);

        const analysis: UIAnalysis = {
          colors: colorResults,
          fonts: fontResults,
          images: imageResults.images,
          imageAnalysis: imageResults.analysis,
          contrastIssues: accessibilityResults.contrastIssues || [],
          violations: accessibilityResults.violations || [],
          accessibilityScore: accessibilityResults.score || 0,
          schemaVersion: CURRENT_VERSION,
          scrapedAt: new Date().toISOString()
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Unified UI analysis completed in ${duration}ms: ${analysis.fonts.length} fonts, ${analysis.colors.length} colors, ${analysis.images.length} images, accessibility score: ${analysis.accessibilityScore}`);

        // Cache the completed analysis with status: 'complete'
        const analysisWithStatus = { ...analysis, status: 'complete' };
        await unifiedCache.set('ui_analysis', url, analysisWithStatus, 24 * 60 * 60 * 1000);

        return analysis;

          } finally {
            if (browser) {
              await browser.close();
            }
          }
        }, 'ui-analysis'); // Task name for queue logging
      } catch (playwrightError) {
        console.warn(`🔧 Playwright analysis failed: ${playwrightError.message}. Falling back to lightweight analysis.`);
        return this.fallbackAnalysis(url, startTime);
      }
    });
  }

  /**
   * Get cached UI analysis without running new analysis
   */
  static async getCachedUI(url: string): Promise<UIAnalysis | null> {
    try {
      return await unifiedCache.get('ui_analysis', url);
    } catch (error) {
      console.warn(`Cache lookup failed for ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Fallback analysis when Playwright fails
   */
  private static async fallbackAnalysis(url: string, startTime: number): Promise<UIAnalysis> {
    console.log(`⚡ Running fallback analysis for: ${url}`);
    
    const analysis: UIAnalysis = {
      colors: [],
      fonts: [],
      images: [],
      imageAnalysis: {
        totalImages: 0,
        estimatedPhotos: 0,
        estimatedIcons: 0,
        imageUrls: [],
        photoUrls: [],
        iconUrls: [],
        altStats: {
          withAlt: 0,
          withoutAlt: 0,
          emptyAlt: 0,
          totalImages: 0
        }
      },
      contrastIssues: [],
      violations: [],
      accessibilityScore: 0,
      schemaVersion: CURRENT_VERSION,
      scrapedAt: new Date().toISOString(),
      status: 'fallback'
    };

    const duration = Date.now() - startTime;
    console.log(`✅ Fallback analysis completed in ${duration}ms`);
    
    return analysis;
  }

  /**
   * Get cached UI analysis if available, checking schema version
   */
  static async getCachedUI(url: string): Promise<UIAnalysis | null> {
    const cached = await unifiedCache.get('ui_analysis', url);
    
    // Check schema version - if stale, return null to trigger fresh scrape
    if (cached && cached.schemaVersion !== CURRENT_VERSION) {
      console.log(`🔄 Schema version mismatch for ${url}: cached ${cached.schemaVersion} vs current ${CURRENT_VERSION}, triggering fresh scrape`);
      return null;
    }
    
    return cached;
  }

  /**
   * Get or create analysis with schema version protection
   * Returns { status: 'pending' } for stale cache, fresh analysis otherwise
   */
  static async getOrCreateAnalysis(url: string): Promise<UIAnalysis | { status: 'pending' }> {
    // First check cache with schema version validation
    const cached = await this.getCachedUI(url);
    if (cached) {
      return cached;
    }
    
    // Check if a fresh scrape is already in progress to avoid duplicate work
    const cacheKey = `ui_analysis_${url}`;
    const inProgress = (unifiedCache as any).concurrentRequests?.[cacheKey];
    if (inProgress) {
      console.log(`⏳ Fresh scrape already in progress for ${url}, returning pending status`);
      return { status: 'pending' };
    }
    
    try {
      // Trigger fresh analysis
      const analysis = await this.analyzeUI(url);
      return analysis;
    } catch (error) {
      console.error(`❌ Failed to analyze ${url}:`, error);
      return { status: 'pending' };
    }
  }

  /**
   * Force fresh scrape (bypass cache)
   */
  static async scrape(url: string, options: { force?: boolean } = {}): Promise<UIAnalysis> {
    if (options.force) {
      await this.invalidateCache(url);
    }
    return this.analyzeUI(url);
  }

  /**
   * Invalidate cache for a specific URL
   */
  static async invalidateCache(url: string): Promise<void> {
    return unifiedCache.invalidate('ui_analysis', url);
  }
}