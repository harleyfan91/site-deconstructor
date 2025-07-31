/**
 * Axe-core integration for accessibility analysis
 * Injects axe-core into Playwright pages for real contrast and accessibility testing
 */
import { Page } from 'playwright';
import { SupabaseCacheService } from './supabase';
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
    
    const violations = (axeResults as any).violations || [];

    // Extract contrast-specific violations
    const contrastViolations = violations.filter((v: any) => v.id === 'color-contrast');
    const contrastIssues: ContrastIssue[] = contrastViolations.flatMap((violation: any) =>
      violation.nodes.map((node: any) => {
        // Extract color information from the violation data
        const target = node.target.join(' ');
        
        // Parse colors from the failure summary or use defaults
        let textColor = '#000000';
        let backgroundColor = '#ffffff';
        let ratio = 1;
        let expectedRatio = 4.5;
        
        if (node.any && node.any[0] && node.any[0].data) {
          const data = node.any[0].data;
          textColor = data.fgColor || textColor;
          backgroundColor = data.bgColor || backgroundColor;
          ratio = data.contrastRatio || ratio;
          expectedRatio = data.expectedContrastRatio || expectedRatio;
        }

        return {
          element: target,
          textColor,
          backgroundColor,
          ratio: Math.round(ratio * 100) / 100,
          expectedRatio,
          severity: violation.impact,
          recommendation: `Increase contrast ratio to at least ${expectedRatio}:1`
        };
      })
    );

    // Calculate accessibility score based on violations
    const totalRules = ((axeResults as any).passes?.length || 0) + violations.length;
    const failedRules = violations.length;
    const passedRules = totalRules - failedRules;
    const score = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 0;

    console.log(`✅ Axe analysis completed: ${violations.length} violations found, ${passedRules} passed, score: ${score}`);

    return {
      contrastIssues,
      violations: violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((node: any) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary || ''
        }))
      })),
      passedRules,
      failedRules,
      score
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