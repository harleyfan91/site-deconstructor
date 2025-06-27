import { chromium } from 'playwright';
import Color from 'color';
import colorNamer from 'color-namer';

export interface ColorItem {
  name: string;
  hex: string;
  usage: string;
  count: number;
}

/**  Main entry: given a URL, return colors in the format expected by the frontend */
export async function extractColours(url: string): Promise<ColorItem[]> {
  try {
    const browser = await chromium.launch();
    const page    = await browser.newPage({ userAgent: 'Mozilla/5.0' });
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });

    // 1. In-browser collection
    const raw = await page.evaluate(() => {
      const buckets = { background: {} as Record<string, number>,
                        text:       {} as Record<string, number>,
                        icon:       {} as Record<string, number>,
                        border:     {} as Record<string, number> };
      const push = (b: Record<string, number>, c: string) =>
        (b[c] = (b[c] || 0) + 1);

      for (const el of Array.from(document.querySelectorAll('*'))) {
        const cs = getComputedStyle(el as Element);
        if (cs.backgroundColor) push(buckets.background, cs.backgroundColor);
        if (cs.color)           push(buckets.text,       cs.color);
        if ((cs as any).fill)   push(buckets.icon,       (cs as any).fill);
        if ((cs as any).stroke) push(buckets.icon,       (cs as any).stroke);
        ['Top','Right','Bottom','Left'].forEach(side=>{
          const c = cs.getPropertyValue(`border-${side.toLowerCase()}-color`);
          if (c) push(buckets.border,c);
        });
      }
      return buckets;
    });
    await browser.close();

    // 2. Normalise + name
    const normalise = (rawCol:string) => {
      try { const col=Color(rawCol); if(col.alpha()===0) return null; return col.hex().toUpperCase(); }
      catch { return null; }
    };

    const colors: ColorItem[] = [];
    const processed = new Set<string>();

    // Convert usage groups to flat array format expected by frontend
    const usageMapping: Record<string, string> = {
      background: 'Background',
      text: 'Text', 
      icon: 'Icon',
      border: 'Border'
    };

    for (const [usage, rawColors] of Object.entries(raw)) {
      const usageName = usageMapping[usage] || 'Theme';
      
      for (const [rawCol, count] of Object.entries(rawColors)) {
        const hex = normalise(rawCol);
        if (!hex || processed.has(hex)) continue;
        
        const name = colorNamer(hex).ntc[0].name;
        colors.push({ name, hex, usage: usageName, count });
        processed.add(hex);
      }
    }

    // Fallback if no colors found
    if (colors.length === 0) {
      colors.push(
        { name: 'Primary Text', hex: '#000000', usage: 'Text', count: 0 },
        { name: 'Background', hex: '#FFFFFF', usage: 'Background', count: 0 }
      );
    }

    return colors;
  } catch (error) {
    console.error('Playwright color extraction failed:', error);
    // Fallback to basic colors if Playwright fails
    return [
      { name: 'Primary Text', hex: '#000000', usage: 'Text', count: 0 },
      { name: 'Background', hex: '#FFFFFF', usage: 'Background', count: 0 }
    ];
  }
}