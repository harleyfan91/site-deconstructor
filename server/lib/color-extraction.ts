import { chromium, Browser, BrowserContext } from 'playwright';
import PQueue from 'p-queue';
import { colord } from 'colord';
import colorNamer from 'color-namer';

export interface ColorResult {
  hex: string;
  name: string;
  property: string;
  occurrences: number;
}

interface ExtractedColor {
  hex: string;
  property: string;
  count: number;
}

// Global browser instance and queue
let globalBrowser: Browser | null = null;
const queue = new PQueue({ concurrency: 3 });

// Initialize shared browser instance
async function initBrowser(): Promise<Browser> {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
  }
  return globalBrowser;
}

// Cleanup browser on process exit
process.on('exit', async () => {
  if (globalBrowser) {
    await globalBrowser.close();
  }
});

process.on('SIGINT', async () => {
  if (globalBrowser) {
    await globalBrowser.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (globalBrowser) {
    await globalBrowser.close();
  }
  process.exit(0);
});

function normalizeHex(color: string): string {
  try {
    return colord(color).toHex();
  } catch {
    return '';
  }
}

function getColorName(hex: string): string {
  try {
    const result = colorNamer(hex);
    return result.ntc[0]?.name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Calculate color temperature score for sorting
 * Lower scores = unsaturated colors (grays, whites, blacks)
 * Medium scores = warm colors (reds, oranges, yellows)
 * Higher scores = cool colors (blues, greens, purples)
 */
function getColorTemperatureScore(hsl: { h: number; s: number; l: number }): number {
  const { h, s, l } = hsl;
  
  // Very low saturation = unsaturated (grays, whites, blacks) - sort first
  if (s < 10) {
    return 0 + l; // Sort by lightness within unsaturated colors
  }
  
  // Warm colors (reds, oranges, yellows) - sort second
  if ((h >= 0 && h <= 60) || (h >= 300 && h <= 360)) {
    return 100 + h; // Reds to yellows, then purples to reds
  }
  
  // Cool colors (greens, cyans, blues, purples) - sort last
  if (h > 60 && h < 300) {
    return 200 + h; // Yellows to greens to blues to purples
  }
  
  return 300; // Fallback
}

/**
 * Maps CSS property and element context to semantic color buckets
 */
function getBucketForProperty(property: string, elementTag?: string, value?: string): string {
  // Background colors
  if (property === 'background-color') return 'background';
  if (property === 'background' && value && !value.includes('gradient(')) return 'background';
  
  // Text colors
  if (property === 'color') return 'text';
  if (property.startsWith('text-') && !['text-decoration-color', 'text-emphasis-color', 'text-stroke-color'].includes(property)) {
    return 'text';
  }
  
  // Border colors
  if (property.includes('border') && property.includes('color')) return 'border';
  if (property === 'outline-color' || property === 'column-rule-color') return 'border';
  
  // Icon colors (SVG on icon-like elements)
  if ((property === 'fill' || property === 'stroke') && 
      (elementTag === 'svg' || elementTag === 'path' || elementTag === 'circle' || elementTag === 'rect')) {
    return 'icons';
  }
  
  // Accent colors
  if (property === 'accent-color' || property === 'caret-color') return 'accent';
  
  // Decoration colors
  if (['text-decoration-color', 'text-emphasis-color', 'text-stroke-color'].includes(property)) {
    return 'decoration';
  }
  
  // Shadow colors
  if (property === 'box-shadow' || property === 'text-shadow') return 'shadow';
  if (property === 'filter' && value && value.includes('drop-shadow(')) return 'shadow';
  
  // Gradient colors
  if ((property === 'background' || property === 'background-image' || property === 'mask-image') && 
      value && value.includes('gradient(')) {
    return 'gradient';
  }
  
  // SVG-specific colors (non-icon SVG elements)
  if (['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'].includes(property) && 
      elementTag && !['svg', 'path', 'circle', 'rect'].includes(elementTag)) {
    return 'svg';
  }
  
  // Link colors (handled in DOM evaluation for pseudo-classes)
  if (property.includes('link') || elementTag === 'a') return 'link';
  
  // Highlight colors
  if (property === 'highlight-color' || elementTag === 'mark') return 'highlight';
  
  // Default fallback
  return 'other';
}

async function extractColorsFromPage(url: string): Promise<ColorResult[]> {
  const browser = await initBrowser();
  let context: BrowserContext | null = null;
  
  try {
    // Create new browser context for isolation
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Set timeout and navigate
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    // Extract colors from up to 5000 DOM nodes
    const colors = await page.evaluate(() => {
      const extractedColors: { hex: string; property: string; elementTag: string; value: string }[] = [];
      const colorProperties = [
        'color',
        'background-color',
        'background',
        'background-image',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-color',
        'outline-color',
        'column-rule-color',
        'fill',
        'stroke',
        'accent-color',
        'caret-color',
        'text-decoration-color',
        'text-emphasis-color',
        'text-stroke-color',
        'box-shadow',
        'text-shadow',
        'filter',
        'mask-image',
        'stop-color',
        'flood-color',
        'lighting-color',
        'highlight-color'
      ];
      
      // Get all elements, limited to 5000
      const elements = Array.from(document.querySelectorAll('*')).slice(0, 5000);
      
      elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const tagName = element.tagName.toLowerCase();
        
        colorProperties.forEach(property => {
          let value = computedStyle.getPropertyValue(property);
          if (!value || value === 'none' || value === 'transparent') return;
          
          // Extract colors from shadow values
          if (property === 'box-shadow' || property === 'text-shadow') {
            const shadowColors = value.match(/(rgb|hsl|#)[^,\s)]+/g);
            if (shadowColors) {
              shadowColors.forEach(color => {
                extractedColors.push({ hex: color.trim(), property, elementTag: tagName, value });
              });
            }
            return;
          }
          
          // Extract colors from filter drop-shadow
          if (property === 'filter' && value.includes('drop-shadow(')) {
            const filterColors = value.match(/drop-shadow\([^)]*?(rgb|hsl|#)[^)]+\)/g);
            if (filterColors) {
              filterColors.forEach(filter => {
                const color = filter.match(/(rgb|hsl|#)[^,\s)]+/);
                if (color) {
                  extractedColors.push({ hex: color[0].trim(), property, elementTag: tagName, value });
                }
              });
            }
            return;
          }
          
          // Extract colors from gradients
          if ((property === 'background' || property === 'background-image' || property === 'mask-image') && 
              value.includes('gradient(')) {
            const gradientColors = value.match(/(rgb|hsl|#)[^,\s)]+/g);
            if (gradientColors) {
              gradientColors.forEach(color => {
                extractedColors.push({ hex: color.trim(), property, elementTag: tagName, value });
              });
            }
            return;
          }
          
          // Handle multiple border colors
          if (property === 'border-color') {
            const colors = value.split(' ');
            colors.forEach(color => {
              if (color && color !== 'none' && color !== 'transparent') {
                extractedColors.push({ hex: color.trim(), property, elementTag: tagName, value });
              }
            });
          } else {
            // Check for single color values
            if (value.match(/(rgb|hsl|#)/)) {
              extractedColors.push({ hex: value.trim(), property, elementTag: tagName, value });
            }
          }
        });
        
        // Special handling for link pseudo-classes and mark elements
        if (tagName === 'a') {
          const linkColor = computedStyle.getPropertyValue('color');
          if (linkColor && linkColor !== 'none' && linkColor !== 'transparent') {
            extractedColors.push({ hex: linkColor, property: 'color', elementTag: 'a', value: linkColor });
          }
        }
        
        if (tagName === 'mark') {
          const markBg = computedStyle.getPropertyValue('background-color');
          if (markBg && markBg !== 'none' && markBg !== 'transparent') {
            extractedColors.push({ hex: markBg, property: 'background-color', elementTag: 'mark', value: markBg });
          }
        }
      });
      
      return extractedColors;
    });
    
    // Process and normalize colors
    const colorMap = new Map<string, ExtractedColor>();
    
    colors.forEach(({ hex, property, elementTag, value }) => {
      const normalizedHex = normalizeHex(hex);
      if (!normalizedHex || normalizedHex === '#000000' && hex.includes('transparent')) {
        return;
      }
      
      const bucket = getBucketForProperty(property, elementTag, value);
      const key = `${normalizedHex}-${bucket}`;
      if (colorMap.has(key)) {
        colorMap.get(key)!.count++;
      } else {
        colorMap.set(key, {
          hex: normalizedHex,
          property: bucket, // Store the bucket instead of raw property
          count: 1
        });
      }
    });
    
    // Convert to result format with names and sort by hue within each bucket
    const colorsByBucket: Record<string, ColorResult[]> = {};
    
    Array.from(colorMap.values()).forEach(color => {
      const colorResult: ColorResult = {
        hex: color.hex,
        name: getColorName(color.hex),
        property: color.property,
        occurrences: color.count
      };
      
      if (!colorsByBucket[color.property]) {
        colorsByBucket[color.property] = [];
      }
      colorsByBucket[color.property].push(colorResult);
    });
    
    // Sort each bucket by color temperature (unsaturated → warm → cool)
    Object.keys(colorsByBucket).forEach(bucket => {
      colorsByBucket[bucket].sort((a, b) => {
        const hslA = colord(a.hex).toHsl();
        const hslB = colord(b.hex).toHsl();
        
        // Get temperature score for each color
        const tempA = getColorTemperatureScore(hslA);
        const tempB = getColorTemperatureScore(hslB);
        
        return tempA - tempB;
      });
    });
    
    // Flatten back to single array while preserving bucket order and hue sorting
    const results: ColorResult[] = [];
    Object.values(colorsByBucket).forEach(bucketColors => {
      results.push(...bucketColors);
    });
    
    return results;
    
  } catch (error) {
    console.error('Color extraction error:', error);
    throw error;
  } finally {
    if (context) {
      await context.close();
    }
  }
}

export async function extractColors(url: string): Promise<ColorResult[]> {
  return queue.add(async () => extractColorsFromPage(url)) as Promise<ColorResult[]>;
}

export async function closeBrowser(): Promise<void> {
  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = null;
  }
}