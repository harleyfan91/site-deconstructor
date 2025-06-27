export interface RegexRule {
  regex: RegExp;
  fallbackMinCount: number;
}

export const regexConfig: Record<string, RegexRule> = {
  Background: {
    regex: /(?:^|[\s{])(?:body|html)[^{]*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/gi,
    fallbackMinCount: 1,
  },
  Text: {
    regex: /(?:^|[^-])color:\s*(#[0-9a-fA-F]{3,6})/gi,
    fallbackMinCount: 2,
  },
  Border: {
    regex: /border(?:-\w+)?-color:\s*(#[0-9a-fA-F]{3,6})/gi,
    fallbackMinCount: 2,
  },
  Accent: {
    regex: /box-shadow:[^;]*?(#[0-9a-fA-F]{3,6})/gi,
    fallbackMinCount: 1,
  },
};

export function extractCssContent(html: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  let css = '';
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1] + ' ';
  }
  return css;
}

export async function fetchExternalCss(html: string, pageUrl: string): Promise<string> {
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const cssParts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      const url = new URL(href, pageUrl).toString();
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (res.ok) {
        cssParts.push(await res.text());
      }
    } catch {
      // ignore failures
    }
  }
  return cssParts.join(' ');
}

function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#FFFFFF': 'White',
    '#000000': 'Black',
  };
  return colorNames[hex.toUpperCase()] || hex;
}

export function extractCssColors(html: string): Array<{name: string; hex: string; usage: string; count: number}> {
  const css = extractCssContent(html);
  const cssPlusExternal = css + ' ' + html;
  const allContent = html + ' ' + css;
  const colorCounts: Record<string, number> = {};
  const allColorRegex = /#[0-9a-fA-F]{3,6}/g;
  const matches = allContent.match(allColorRegex) || [];
  matches.forEach(hex => {
    const up = hex.toUpperCase();
    colorCounts[up] = (colorCounts[up] || 0) + 1;
  });

  const results: Array<{name: string; hex: string; usage: string; count: number}> = [];
  const processed = new Set<string>();

  for (const [usage, cfg] of Object.entries(regexConfig)) {
    const found = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = cfg.regex.exec(cssPlusExternal)) !== null) {
      found.add(m[1].toUpperCase());
    }
    if (found.size === 0 && cfg.fallbackMinCount > 0) {
      for (const [hex, cnt] of Object.entries(colorCounts)) {
        if (cnt >= cfg.fallbackMinCount) {
          found.add(hex);
        }
      }
    }
    Array.from(found).forEach(hex => {
      if (!processed.has(hex)) {
        results.push({ name: getColorName(hex), hex, usage, count: colorCounts[hex] || 0 });
        processed.add(hex);
      }
    });
  }

  return results;
}
