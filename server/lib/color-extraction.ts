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
      const extractedColors: { hex: string; property: string }[] = [];
      const colorProperties = [
        'color',
        'background-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-color',
        'fill',
        'stroke'
      ];
      
      // Get all elements, limited to 5000
      const elements = Array.from(document.querySelectorAll('*')).slice(0, 5000);
      
      elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        
        colorProperties.forEach(property => {
          let value = computedStyle.getPropertyValue(property);
          if (!value || value === 'none' || value === 'transparent') return;
          
          // Handle multiple border colors
          if (property === 'border-color') {
            const colors = value.split(' ');
            colors.forEach(color => {
              if (color && color !== 'none' && color !== 'transparent') {
                extractedColors.push({ hex: color.trim(), property });
              }
            });
          } else {
            extractedColors.push({ hex: value.trim(), property });
          }
        });
      });
      
      return extractedColors;
    });
    
    // Process and normalize colors
    const colorMap = new Map<string, ExtractedColor>();
    
    colors.forEach(({ hex, property }) => {
      const normalizedHex = normalizeHex(hex);
      if (!normalizedHex || normalizedHex === '#000000' && hex.includes('transparent')) {
        return;
      }
      
      const key = `${normalizedHex}-${property}`;
      if (colorMap.has(key)) {
        colorMap.get(key)!.count++;
      } else {
        colorMap.set(key, {
          hex: normalizedHex,
          property,
          count: 1
        });
      }
    });
    
    // Convert to result format with names
    const results: ColorResult[] = Array.from(colorMap.values())
      .map(color => ({
        hex: color.hex,
        name: getColorName(color.hex),
        property: color.property,
        occurrences: color.count
      }))
      .sort((a, b) => b.occurrences - a.occurrences);
    
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