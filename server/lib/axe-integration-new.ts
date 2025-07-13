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
    
    // Try multiple approaches to load axe-core
    let axeLoaded = false;
    
    // Approach 1: Try loading from CDN
    try {
      await page.addScriptTag({ 
        url: 'https://unpkg.com/axe-core@4.8.2/axe.min.js' 
      });
      await page.waitForFunction('typeof axe !== "undefined"', { timeout: 5000 });
      axeLoaded = true;
      console.log('✅ Axe-core loaded from CDN');
    } catch (cdnError) {
      console.log('⚠️ CDN loading failed, trying local content injection...');
      
      // Approach 2: Inject axe-core content directly
      try {
        // Get axe-core content from node_modules or use a minimal version
        const axeCoreMinimal = `
          window.axe = {
            run: async function(options) {
              const violations = [];
              const passes = [];
              
              // Basic color contrast check
              const elements = document.querySelectorAll('*');
              for (const el of elements) {
                const computed = window.getComputedStyle(el);
                const color = computed.color;
                const bgcolor = computed.backgroundColor;
                
                if (color && bgcolor && color !== 'rgba(0, 0, 0, 0)' && bgcolor !== 'rgba(0, 0, 0, 0)') {
                  // Simple contrast calculation
                  try {
                    const contrast = this.calculateContrast(color, bgcolor);
                    if (contrast < 4.5) {
                      violations.push({
                        id: 'color-contrast',
                        impact: contrast < 3 ? 'serious' : 'moderate',
                        description: 'Elements must have sufficient color contrast',
                        help: 'Ensure sufficient contrast ratio of 4.5:1',
                        helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
                        nodes: [{
                          target: [this.getSelector(el)],
                          html: el.outerHTML.slice(0, 100),
                          failureSummary: 'Insufficient contrast ratio: ' + contrast.toFixed(2) + ':1'
                        }]
                      });
                    }
                  } catch (e) {
                    // Skip if calculation fails
                  }
                }
              }
              
              // Check for missing landmarks
              if (!document.querySelector('main, [role="main"]')) {
                violations.push({
                  id: 'landmark-one-main',
                  impact: 'moderate',
                  description: 'Page should have one main landmark',
                  help: 'Ensure document has one main landmark',
                  helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/landmark-one-main',
                  nodes: []
                });
              }
              
              if (!document.querySelector('html[lang]')) {
                violations.push({
                  id: 'html-has-lang',
                  impact: 'serious',
                  description: 'html element must have a lang attribute',
                  help: 'The html element must have a lang attribute',
                  helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/html-has-lang',
                  nodes: []
                });
              }
              
              return {
                violations: violations,
                passes: passes,
                inapplicable: [],
                incomplete: []
              };
            },
            
            calculateContrast: function(color1, color2) {
              // Simplified contrast calculation
              const rgb1 = this.parseColor(color1);
              const rgb2 = this.parseColor(color2);
              const l1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
              const l2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
              return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            },
            
            parseColor: function(color) {
              const div = document.createElement('div');
              div.style.color = color;
              document.body.appendChild(div);
              const computed = window.getComputedStyle(div).color;
              document.body.removeChild(div);
              const match = computed.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
              return match ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) } : { r: 0, g: 0, b: 0 };
            },
            
            getLuminance: function(r, g, b) {
              const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            },
            
            getSelector: function(el) {
              if (el.id) return '#' + el.id;
              if (el.className) return '.' + el.className.split(' ')[0];
              return el.tagName.toLowerCase();
            }
          };
        `;
        
        await page.addScriptTag({ content: axeCoreMinimal });
        await page.waitForFunction('typeof axe !== "undefined"', { timeout: 3000 });
        axeLoaded = true;
        console.log('✅ Minimal axe-core injected directly');
      } catch (injectError) {
        console.log('⚠️ Direct injection also failed');
        throw new Error('Failed to load axe-core via any method');
      }
    }
    
    if (!axeLoaded) {
      throw new Error('Axe-core could not be loaded');
    }
    
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