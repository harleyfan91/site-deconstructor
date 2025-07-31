import assert from 'node:assert';
import { detectSocialMeta, detectShareButtons, detectCookieScripts, detectMinification, checkLinks } from '../dist/lib/social.js';

const html = `
<meta property="og:title" content="t">
<meta name="twitter:card" content="s">
<link rel="stylesheet" href="style.min.css">
<script src="app.min.js"></script>
<script src="cookieconsent.js"></script>
<a href="http://insecure.com/page"></a>
<a href="https://good.com/"></a>
`;

const social = detectSocialMeta(html);
assert.strictEqual(social.hasOpenGraph, true);
assert.strictEqual(social.hasTwitterCard, true);
assert.strictEqual(detectShareButtons('<a href="https://twitter.com/share">t</a>'), true);

const cookie = detectCookieScripts(html);
assert.ok(cookie.hasCookieScript);
assert.ok(cookie.scripts.includes('cookieconsent'));

const mini = detectMinification(html);
assert.ok(mini.cssMinified);
assert.ok(mini.jsMinified);

async function fetcher(url, _opts) {
  if (url.includes('good.com')) return { ok: true };
  return { ok: false };
}

const links = await checkLinks(html, 'https://example.com', fetcher);
assert.deepStrictEqual(links.brokenLinks, ['http://insecure.com/page']);
assert.deepStrictEqual(links.mixedContentLinks, ['http://insecure.com/page']);

console.log('social checks test passed');
