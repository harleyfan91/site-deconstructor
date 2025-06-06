export interface ContrastIssue {
  textColor: string;
  backgroundColor: string;
  ratio: number;
}

function hexToRgb(hex: string): {r:number;g:number;b:number} | null {
  const match = hex.replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  let h = match[0];
  if (h.length === 3) h = h.split('').map(c=>c+c).join('');
  const num = parseInt(h, 16);
  return {r:(num>>16)&255, g:(num>>8)&255, b:num&255};
}

function luminance(rgb:{r:number;g:number;b:number}): number {
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    const c = v/255;
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  });
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}

export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if(!rgb1 || !rgb2) return 0;
  const L1 = luminance(rgb1);
  const L2 = luminance(rgb2);
  return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
}

export function extractContrastIssues(html: string): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  const styleRegex = /style=["']([^"']+)["']/gi;
  let match;
  while((match = styleRegex.exec(html)) !== null) {
    const style = match[1];
    const color = /color:\s*(#[0-9a-fA-F]{3,6})/i.exec(style)?.[1];
    const bg = /background-color:\s*(#[0-9a-fA-F]{3,6})/i.exec(style)?.[1];
    if(color && bg) {
      const ratio = contrastRatio(color, bg);
      if(ratio < 4.5) {
        issues.push({ textColor: color, backgroundColor: bg, ratio: parseFloat(ratio.toFixed(2)) });
      }
    }
  }
  return issues;
}


export async function extractCssColors(
  html: string,
  vibrant?: { from: (src: string) => { getPalette: () => Promise<Record<string, { hex: string }> > } }
): Promise<string[]> {
  const fallback = (): string[] => {

    const colorRegex = /#[0-9a-fA-F]{6}/g;
    const matches = html.match(colorRegex) || [];
    const counts: Record<string, number> = {};
    matches.forEach(hex => {
      counts[hex] = (counts[hex] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    return sorted.slice(0,5).map(([hex])=>hex);
  };

  try {
    if (!vibrant) {
      // @ts-ignore optional dependency loaded at runtime
      const mod = (await import('node-vibrant')) as any;
      vibrant = mod.default ?? mod;
    }

    const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["']/i);
    const imgUrl = imgMatch ? imgMatch[1] : null;
    if (!imgUrl || !vibrant) {
      return fallback();
    }

    const palette = await vibrant.from(imgUrl).getPalette();
    const colors = Object.values(palette)
      .filter(Boolean)
      .map((sw: any) => sw.hex)
      .filter(Boolean) as string[];

    if (colors.length === 0) return fallback();
    return colors.slice(0, 5);
  } catch (_e) {

    return fallback();
  }
}

export function extractFontFamilies(html: string): string[] {
  const fontRegex = /font-family:\s*([^;]+)/gi;
  const matches = html.match(fontRegex) || [];
  const families = matches.map(m => m.replace(/font-family:/i,'').split(',')[0].replace(/['"]/g,'').trim());
  return Array.from(new Set(families)).slice(0,3);
}
