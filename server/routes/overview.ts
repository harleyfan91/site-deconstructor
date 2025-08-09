import { Router } from 'express';
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';
import { db } from '../db.js';
import { scanResults } from '../../shared/schema.js';
import { getLighthousePerformance } from '../lib/lighthouse-service.js';
import { extractSEOData } from '../lib/seo-extractor.js';
import { extractColors } from '../lib/color-extraction.js';
import * as colorHelpers from '../lib/color-extraction.js';
import { runAxeAnalysis } from '../lib/axe-integration.js';
import { getTechnicalAnalysis } from '../lib/tech-lightweight.js';
import { chromium } from 'playwright';

const router = Router();

async function performAnalysis(url: string) {
  const start = Date.now();
  const results: any = { data: {} };

  try {
    const performance = await getLighthousePerformance(url);
    const seo = await extractSEOData(url);
    const colors = await extractColors(url);
    const tech = await getTechnicalAnalysis(url);

    let accessibility: any = { contrastIssues: [], violations: [], score: 0 };
    try {
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      accessibility = await runAxeAnalysis(page, url);
      await browser.close();
    } catch (err) {
      console.error('Accessibility analysis failed:', err);
    }

    results.data = {
      overview: {
        overallScore: performance.score,
        seoScore: seo.score,
        userExperienceScore: accessibility.score,
        colors: colors.map(c => c.hex),
        contrastIssues: accessibility.contrastIssues,
      },
      performance: {
        performanceScore: performance.score,
        coreWebVitals: {
          lcpMs: performance.metrics.largestContentfulPaint?.numericValue || 0,
          inpMs: performance.metrics.interactionToNextPaint?.numericValue || 0,
          cls: performance.metrics.cumulativeLayoutShift?.numericValue || 0,
        },
        pageLoadTime: performance.pageLoadTime,
      },
      seo,
      ui: {
        colors,
        contrastIssues: accessibility.contrastIssues,
      },
      technical: {
        accessibility: {
          violations: accessibility.violations?.map((v: any) => ({ id: v.id, description: v.description })) || [],
        },
      },
      tech,
    };

    const duration = Date.now() - start;
    return { duration, results };
  } catch (error) {
    const duration = Date.now() - start;
    throw { error, duration, results };
  }
}

async function handleAnalysis(url: string) {
  const normalizedUrl = normalizeUrl(url);
  let status: 'ok' | 'error' = 'ok';
  let errorMsg: string | null = null;
  let analysisResults: any = {};
  let duration = 0;

  try {
    const { duration: d, results } = await performAnalysis(normalizedUrl);
    duration = d;
    analysisResults = results;
  } catch (err: any) {
    status = 'error';
    duration = err.duration || 0;
    analysisResults = err.results || {};
    errorMsg = err.error ? (err.error.message || String(err.error)) : 'analysis failed';
  }

  // Normalize color data for UI consumption
  const hexes =
    analysisResults?.ui?.colors ??
    analysisResults?.data?.ui?.colors ??
    analysisResults?.data?.overview?.colors ?? [];

  const toName = (hex: string) => {
    try {
      const fn = (colorHelpers as any).getColorName;
      return typeof fn === 'function' ? fn(hex) : '';
    } catch {
      return '';
    }
  };

  const normalizedColors = (hexes as any[]).map((c: any) => {
    const hex = typeof c === 'string' ? c : c.hex;
    return {
      hex,
      name: toName(hex),
      usage: 'palette',
      count: 1,
    };
  });

  analysisResults.ui = { ...(analysisResults.ui || {}), colors: normalizedColors };
  if (analysisResults.ui.contrastViolations === undefined) {
    analysisResults.ui.contrastViolations = 0;
  }

  const [row] = await db.insert(scanResults).values({
    url: normalizedUrl,
    durationMs: duration,
    status,
    error: errorMsg,
    results: analysisResults,
  }).returning({ id: scanResults.id });

  return { id: row.id, url: normalizedUrl, status, duration_ms: duration, error: errorMsg, results: analysisResults };
}

router.get('/api/overview', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : undefined;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  const response = await handleAnalysis(url);
  res.status(response.status === 'ok' ? 200 : 500).json(response);
});

router.post('/api/overview', async (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }
  const response = await handleAnalysis(url);
  res.status(response.status === 'ok' ? 200 : 500).json(response);
});

export default router;

