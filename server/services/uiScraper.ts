/**
 * Unified UI Scraper Service
 * Consolidates color, font, accessibility, and image analysis into a single Playwright session
 */

import { chromium, Browser, Page } from 'playwright';
import { UIAnalysis, ColorResult, FontResult, ImageResult, ContrastIssue, AccessibilityViolation, ImageAnalysis } from '../../types/UIAnalysis';
import { unifiedCache } from '../lib/cache';

// Import existing utilities
import { extractColors } from '../lib/color-extraction';
import { getAccessibilityAnalysis } from '../lib/axe-integration-new';

const SCHEMA_VERSION = '1.0.0';

/**
 * Browser configuration for consistent scraping
 */
const BROWSER_CONFIG = {
  headless: true,
  executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
};

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
      
      let browser: Browser | null = null;
      try {
        // Launch browser
        browser = await chromium.launch(BROWSER_CONFIG);
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

        // Run all extractions in parallel where possible
        const [
          colorResults,
          fontResults,
          imageResults,
          accessibilityResults
        ] = await Promise.all([
          extractColors(url).catch(err => {
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
          schemaVersion: SCHEMA_VERSION,
          scrapedAt: new Date().toISOString()
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Unified UI analysis completed in ${duration}ms: ${analysis.fonts.length} fonts, ${analysis.colors.length} colors, ${analysis.images.length} images, accessibility score: ${analysis.accessibilityScore}`);

        return analysis;

      } finally {
        if (browser) {
          await browser.close();
        }
      }
    });
  }

  /**
   * Get cached UI analysis if available
   */
  static async getCachedUI(url: string): Promise<UIAnalysis | null> {
    return unifiedCache.get('ui_analysis', url);
  }

  /**
   * Invalidate cache for a specific URL
   */
  static async invalidateCache(url: string): Promise<void> {
    return unifiedCache.invalidate('ui_analysis', url);
  }
}