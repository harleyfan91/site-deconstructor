
import FontFaceObserver from 'fontfaceobserver';

export interface FontAnalysisResult {
  name: string;
  category: string;
  usage: string;
  weight: string;
  isLoaded?: boolean;
  isPublic?: boolean;
}

export async function analyzeFontsOnPage(): Promise<FontAnalysisResult[]> {
  const elements = Array.from(document.querySelectorAll('body *'));
  const seenFamilies = new Set<string>();
  const results: FontAnalysisResult[] = [];

  for (const el of elements) {
    const styles = getComputedStyle(el);
    const { fontFamily, fontWeight, fontStyle } = styles;
    
    // Clean up font family name (remove quotes and fallbacks)
    const cleanFontFamily = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    
    if (seenFamilies.has(cleanFontFamily) || !cleanFontFamily) continue;
    seenFamilies.add(cleanFontFamily);

    let isLoaded = false;
    try {
      const observer = new FontFaceObserver(cleanFontFamily, { 
        weight: fontWeight, 
        style: fontStyle 
      });
      await observer.load(null, 3000);
      isLoaded = true;
    } catch {
      isLoaded = false;
    }

    // Check if font is publicly available (Google Fonts, system fonts, etc.)
    const isPublic = await checkIfPublicFont(cleanFontFamily);
    
    // Determine font category
    const category = determineFontCategory(cleanFontFamily);
    
    // Determine usage context
    const usage = determineFontUsage(el, styles);

    results.push({
      name: cleanFontFamily,
      category,
      usage,
      weight: fontWeight,
      isLoaded,
      isPublic
    });
  }

  return results;
}

function determineFontCategory(fontFamily: string): string {
  const serifFonts = ['Times', 'Georgia', 'serif'];
  const sansSerifFonts = ['Arial', 'Helvetica', 'sans-serif'];
  const monospaceFonts = ['Courier', 'Monaco', 'monospace'];
  
  const lowerFamily = fontFamily.toLowerCase();
  
  if (serifFonts.some(font => lowerFamily.includes(font.toLowerCase()))) {
    return 'serif';
  }
  if (sansSerifFonts.some(font => lowerFamily.includes(font.toLowerCase()))) {
    return 'sans-serif';
  }
  if (monospaceFonts.some(font => lowerFamily.includes(font.toLowerCase()))) {
    return 'monospace';
  }
  
  return 'display';
}

function determineFontUsage(element: Element, styles: CSSStyleDeclaration): string {
  const tagName = element.tagName.toLowerCase();
  const fontSize = parseFloat(styles.fontSize);
  
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return 'heading';
  }
  
  if (fontSize > 24) {
    return 'display';
  }
  
  if (fontSize < 14) {
    return 'caption';
  }
  
  return 'body';
}

async function checkIfPublicFont(fontFamily: string): Promise<boolean> {
  // Check if it's a system font
  const systemFonts = [
    'Arial', 'Helvetica', 'Times', 'Times New Roman', 'Courier', 'Courier New',
    'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
    'system-ui', 'sans-serif', 'serif', 'monospace'
  ];
  
  if (systemFonts.some(font => fontFamily.toLowerCase().includes(font.toLowerCase()))) {
    return true;
  }

  // Check @font-face rules for external URLs (Google Fonts, etc.)
  try {
    const styleSheets = Array.from(document.styleSheets);
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const fontFamilyRule = rule.style.fontFamily;
            const srcRule = rule.style.src;
            
            if (fontFamilyRule && fontFamilyRule.includes(fontFamily) && srcRule) {
              // Check if src contains external URLs (Google Fonts, etc.)
              if (srcRule.includes('fonts.googleapis.com') || 
                  srcRule.includes('fonts.gstatic.com') ||
                  srcRule.includes('http')) {
                return true;
              }
            }
          }
        }
      } catch (e) {
        // Skip stylesheets that can't be accessed due to CORS
        continue;
      }
    }
  } catch (e) {
    console.warn('Could not access stylesheet rules:', e);
  }

  return false;
}
