export interface SocialMeta {
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasShareButtons: boolean;
}

export interface CookieInfo {
  hasCookieScript: boolean;
  scripts: string[];
}

export interface MinificationInfo {
  cssMinified: boolean;
  jsMinified: boolean;
}

export interface LinkIssueInfo {
  brokenLinks: string[];
  mixedContentLinks: string[];
}

export function detectSocialMeta(html: string): SocialMeta {
  const og = /<meta[^>]+(?:property|name)=["']og:/i.test(html);
  const twitter = /<meta[^>]+(?:property|name)=["']twitter:/i.test(html);
  return { hasOpenGraph: og, hasTwitterCard: twitter, hasShareButtons: false };
}

export function detectShareButtons(html: string): boolean {
  const regex = /(facebook\.com\/sharer|twitter\.com\/share|linkedin\.com\/share|addthis|sharethis|\.share-buttons)/i;
  return regex.test(html);
}

export function detectCookieScripts(html: string): CookieInfo {
  const pattern = /(cookieconsent|cookiebot|onetrust|osano|cookie-script)/gi;
  const matches = html.match(pattern) || [];
  const scripts = Array.from(new Set(matches.map(m => m.toLowerCase())));
  return { hasCookieScript: scripts.length > 0, scripts };
}

export function detectMinification(html: string): MinificationInfo {
  const cssLinks = html.match(/<link[^>]+href=["'][^"']+\.css[^"']*["']/gi) || [];
  const jsScripts = html.match(/<script[^>]+src=["'][^"']+\.js[^"']*["']/gi) || [];
  const cssMinified = cssLinks.some(l => /.min\.css/.test(l));
  const jsMinified = jsScripts.some(s => /.min\.js/.test(s));
  return { cssMinified, jsMinified };
}

export async function checkLinks(
  html: string,
  baseUrl: string,
  fetcher: typeof fetch = fetch
): Promise<LinkIssueInfo> {
  const broken: string[] = [];
  const mixed: string[] = [];
  const anchorRegex = /<a[^>]+href=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRegex.exec(html))) {
    try {
      const href = m[1];
      if (href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
      const url = new URL(href, baseUrl);
      if (baseUrl.startsWith('https://') && url.protocol === 'http:') {
        mixed.push(url.toString());
      }
      const res = await fetcher(url.toString(), { method: 'HEAD' });
      if (!res.ok) broken.push(url.toString());
    } catch (_) {
      broken.push(m[1]);
    }
  }
  return { brokenLinks: Array.from(new Set(broken)), mixedContentLinks: Array.from(new Set(mixed)) };
}
