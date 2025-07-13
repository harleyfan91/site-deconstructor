/**
 * Axe-core integration for accessibility analysis
 * Injects axe-core into Playwright pages for real contrast and accessibility testing
 */
import { Page } from 'playwright';
import { SupabaseCacheService } from './supabase';
import { processAxeResults, getColorContrastReport } from '../../shared/axeUtils';
import * as crypto from 'crypto';

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

export interface ContrastIssue {
  element: string;
  textColor: string;
  backgroundColor: string;
  ratio: number;
  expectedRatio: number;
  severity: string;
  recommendation: string;
  suggestedColor?: string;
}

export interface AccessibilityAnalysis {
  contrastIssues: ContrastIssue[];
  violations: AxeViolation[];
  passedRules: number;
  failedRules: number;
  score: number;
}

export async function runAxeAnalysis(page: Page, url: string): Promise<AccessibilityAnalysis> {
  try {
    console.log(`🔍 Running axe-core accessibility analysis for ${url}`);
    
    // Inject axe-core into the page manually with timeout
    await page.addScriptTag({ 
      url: 'https://unpkg.com/axe-core@4.8.2/axe.min.js' 
    });
    
    // Wait for axe to load with timeout
    await page.waitForFunction('typeof axe !== "undefined"', { timeout: 10000 });
    
    // Run accessibility tests focusing on WCAG 2.0 AA compliance with timeout
    const axeResults = await Promise.race([
      page.evaluate(async () => {
        const results = await (window as any).axe.run({
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
        });
        return results;
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Axe analysis timeout')), 15000))
    ]);
    
    // Use shared utility to process axe results
    const processedResults = processAxeResults(axeResults);
    const contrastReport = getColorContrastReport(processedResults.violations);

    console.log(`✅ Axe analysis completed: ${processedResults.violations.length} violations found, ${processedResults.passedRules} passed, score: ${processedResults.score}`);

    return {
      contrastIssues: contrastReport.map(issue => ({
        element: issue.element,
        textColor: issue.fg,
        backgroundColor: issue.bg,
        ratio: issue.ratio,
        expectedRatio: issue.expectedRatio,
        severity: issue.severity,
        recommendation: issue.recommendation,
        suggestedColor: issue.suggestedColor
      })),
      violations: processedResults.violations,
      passedRules: processedResults.passedRules,
      failedRules: processedResults.failedRules,
      score: processedResults.score
    };
  } catch (error) {
    console.error('Axe analysis failed:', error);
    throw error;
  }
}

export async function getAccessibilityAnalysis(page: Page, url: string): Promise<AccessibilityAnalysis> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `axe_accessibility_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Axe accessibility cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing fresh axe accessibility analysis...');
    const analysis = await runAxeAnalysis(page, url);

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, analysis);
    
    return analysis;
  } catch (error) {
    console.error('Accessibility analysis error:', error);
    // Return empty analysis rather than failing
    return {
      contrastIssues: [],
      violations: [],
      passedRules: 0,
      failedRules: 0,
      score: 0
    };
  }
}