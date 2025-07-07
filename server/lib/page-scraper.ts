import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface FontResult {
  name: string;
  category: string;
  usage: string;
  weight?: string;
  isLoaded?: boolean;
  isPublic?: boolean;
}

export interface ImageResult {
  url: string;
  alt?: string;
  type?: string;
  width?: number;
  height?: number;
  isIcon?: boolean;
  isPhoto?: boolean;
}

export interface ContrastResult {
  textColor: string;
  backgroundColor: string;
  ratio: number;
  element: string;
  isAccessible: boolean;
}

export interface ScrapedData {
  fonts: FontResult[];
  images: ImageResult[];
  contrastIssues: ContrastResult[];
}

let globalBrowser: Browser | null = null;

async function initBrowser(): Promise<Browser> {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
  }
  return globalBrowser;
}

async function extractFontsFromPage(url: string): Promise<FontResult[]> {
  const browser = await initBrowser();
  let context: BrowserContext | null = null;
  
  try {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const fonts = await page.evaluate(() => {
      const fontMap = new Map<string, FontResult>();
      
      // Get all elements with text content
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.trim().length > 0
      ).slice(0, 1000); // Limit to 1000 elements
      
      elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;
        const fontSize = computedStyle.fontSize;
        
        if (fontFamily && fontFamily !== 'inherit') {
          // Clean up font family names
          const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
          
          fonts.forEach(font => {
            if (font && font !== 'inherit' && !fontMap.has(font)) {
              // Determine font category
              let category = 'unknown';
              if (font.toLowerCase().includes('serif') && !font.toLowerCase().includes('sans')) {
                category = 'serif';
              } else if (font.toLowerCase().includes('sans') || 
                         ['Arial', 'Helvetica', 'Calibri', 'Verdana', 'Tahoma'].includes(font)) {
                category = 'sans-serif';
              } else if (['Courier', 'Monaco', 'Consolas', 'monospace'].some(mono => font.toLowerCase().includes(mono.toLowerCase()))) {
                category = 'monospace';
              } else if (['cursive', 'fantasy'].some(type => font.toLowerCase().includes(type))) {
                category = font.toLowerCase().includes('cursive') ? 'cursive' : 'fantasy';
              } else {
                category = 'sans-serif'; // Default assumption
              }
              
              // Determine usage based on element type and font size
              let usage = 'Body text';
              const tagName = element.tagName.toLowerCase();
              const fontSizeNum = parseInt(fontSize);
              
              if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                usage = 'Headings';
              } else if (tagName === 'button' || element.classList.contains('btn')) {
                usage = 'Buttons';
              } else if (tagName === 'nav' || element.classList.contains('nav')) {
                usage = 'Navigation';
              } else if (fontSizeNum > 20) {
                usage = 'Large text';
              } else if (fontSizeNum < 14) {
                usage = 'Small text';
              }
              
              // Check if it's a web font (Google Fonts, custom fonts)
              const isPublic = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 'Trebuchet', 'Impact'].some(
                systemFont => font.toLowerCase().includes(systemFont.toLowerCase())
              );
              
              fontMap.set(font, {
                name: font,
                category,
                usage,
                weight: fontWeight,
                isLoaded: true,
                isPublic: !isPublic
              });
            }
          });
        }
      });
      
      return Array.from(fontMap.values());
    });
    
    return fonts;
  } catch (error) {
    console.error('Font extraction failed:', error);
    return [];
  } finally {
    if (context) {
      await context.close();
    }
  }
}

async function extractImagesFromPage(url: string): Promise<ImageResult[]> {
  const browser = await initBrowser();
  let context: BrowserContext | null = null;
  
  try {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const images = await page.evaluate(() => {
      const imageElements = Array.from(document.querySelectorAll('img'));
      const results: ImageResult[] = [];
      
      imageElements.forEach(img => {
        const src = img.src;
        const alt = img.alt || '';
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        if (src && !src.startsWith('data:')) {
          // Determine if it's likely an icon or photo
          const isSmall = width <= 64 && height <= 64;
          const hasIconKeywords = src.toLowerCase().includes('icon') || 
                                  src.toLowerCase().includes('logo') || 
                                  alt.toLowerCase().includes('icon') || 
                                  alt.toLowerCase().includes('logo');
          const isSvg = src.toLowerCase().includes('.svg');
          
          const isIcon = isSmall || hasIconKeywords || isSvg;
          const isPhoto = !isIcon && (width > 100 || height > 100);
          
          // Determine type from URL
          let type = 'unknown';
          if (src.includes('.jpg') || src.includes('.jpeg')) type = 'JPEG';
          else if (src.includes('.png')) type = 'PNG';
          else if (src.includes('.gif')) type = 'GIF';
          else if (src.includes('.webp')) type = 'WEBP';
          else if (src.includes('.svg')) type = 'SVG';
          
          results.push({
            url: src,
            alt: alt,
            type: type,
            width: width,
            height: height,
            isIcon: isIcon,
            isPhoto: isPhoto
          });
        }
      });
      
      return results;
    });
    
    return images;
  } catch (error) {
    console.error('Image extraction failed:', error);
    return [];
  } finally {
    if (context) {
      await context.close();
    }
  }
}

async function extractContrastFromPage(url: string): Promise<ContrastResult[]> {
  const browser = await initBrowser();
  let context: BrowserContext | null = null;
  
  try {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const contrastIssues = await page.evaluate(() => {
      const results: ContrastResult[] = [];
      
      // Function to calculate relative luminance
      function getLuminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      // Function to calculate contrast ratio
      function getContrastRatio(color1: string, color2: string): number {
        const parseColor = (color: string): [number, number, number] => {
          const div = document.createElement('div');
          div.style.color = color;
          document.body.appendChild(div);
          const rgb = window.getComputedStyle(div).color;
          document.body.removeChild(div);
          
          const match = rgb.match(/\d+/g);
          if (match) {
            return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
          }
          return [0, 0, 0];
        };
        
        const [r1, g1, b1] = parseColor(color1);
        const [r2, g2, b2] = parseColor(color2);
        
        const lum1 = getLuminance(r1, g1, b1);
        const lum2 = getLuminance(r2, g2, b2);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
      }
      
      // Get text elements
      const textElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.trim().length > 0 && 
        !['script', 'style', 'noscript'].includes(el.tagName.toLowerCase())
      ).slice(0, 500); // Limit to 500 elements
      
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const ratio = getContrastRatio(color, backgroundColor);
          
          // Check if it fails WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
          const fontSize = parseFloat(computedStyle.fontSize);
          const fontWeight = computedStyle.fontWeight;
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          
          const minimumRatio = isLargeText ? 3 : 4.5;
          const isAccessible = ratio >= minimumRatio;
          
          if (!isAccessible) {
            results.push({
              textColor: color,
              backgroundColor: backgroundColor,
              ratio: Math.round(ratio * 100) / 100,
              element: element.tagName.toLowerCase(),
              isAccessible: false
            });
          }
        }
      });
      
      return results;
    });
    
    return contrastIssues;
  } catch (error) {
    console.error('Contrast extraction failed:', error);
    return [];
  } finally {
    if (context) {
      await context.close();
    }
  }
}

export async function scrapePageData(url: string): Promise<ScrapedData> {
  console.log(`🔍 Starting comprehensive page scraping for: ${url}`);
  
  try {
    // Run all extractions in parallel for better performance
    const [fonts, images, contrastIssues] = await Promise.all([
      extractFontsFromPage(url),
      extractImagesFromPage(url),
      extractContrastFromPage(url)
    ]);
    
    console.log(`✅ Scraping complete: ${fonts.length} fonts, ${images.length} images, ${contrastIssues.length} contrast issues`);
    
    return {
      fonts,
      images,
      contrastIssues
    };
  } catch (error) {
    console.error('Page scraping failed:', error);
    return {
      fonts: [],
      images: [],
      contrastIssues: []
    };
  }
}