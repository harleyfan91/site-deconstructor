import { describe, it, expect } from 'vitest';
import { detectSocialMeta, detectShareButtons, detectCookieScripts, detectMinification, checkLinks } from '@/lib/social';

const html = `
<meta property="og:title" content="t">
<meta name="twitter:card" content="s">
<link rel="stylesheet" href="style.min.css">
<script src="app.min.js"></script>
<script src="cookieconsent.js"></script>
<a href="http://insecure.com/page"></a>
<a href="https://good.com/"></a>
`;

describe('social utilities', () => {
  it('detects social meta and share buttons', async () => {
    const social = detectSocialMeta(html);
    expect(social.hasOpenGraph).toBe(true);
    expect(social.hasTwitterCard).toBe(true);
    expect(detectShareButtons('<a href="https://twitter.com/share">t</a>')).toBe(true);

    const cookie = detectCookieScripts(html);
    expect(cookie.hasCookieScript).toBe(true);
    expect(cookie.scripts).toContain('cookieconsent');

    const mini = detectMinification(html);
    expect(mini.cssMinified).toBe(true);
    expect(mini.jsMinified).toBe(true);

    async function fetcher(url, _opts) {
      if (url.includes('good.com')) return { ok: true };
      return { ok: false };
    }

    const links = await checkLinks(html, 'https://example.com', fetcher);
    expect(links.brokenLinks).toEqual(['http://insecure.com/page']);
    expect(links.mixedContentLinks).toEqual(['http://insecure.com/page']);
  });
});
