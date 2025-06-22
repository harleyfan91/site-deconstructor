
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import axeCore from 'axe-core';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  group?: string;
}

interface LighthouseResult {
  categories: {
    performance: { score: number };
    'best-practices': { score: number };
  };
  audits: Record<string, LighthouseAudit>;
}

interface AnalysisResult {
  mobileResponsiveness: {
    score: number;
    issues: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  securityScore: {
    grade: string;
    findings: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  accessibility: {
    violations: any[];
  };
  headerChecks: {
    hsts: string;
    csp: string;
    frameOptions: string;
  };
}

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export async function analyze(url: string): Promise<AnalysisResult> {
  console.log(`Starting analysis for: ${url}`);
  
  try {
    // 1. Run Lighthouse analysis
    console.log('Launching Chrome for Lighthouse...');
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    const lighthouseResult = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'best-practices'],
    }) as { lhr: LighthouseResult };

    await chrome.kill();

    const lhr = lighthouseResult.lhr;
    
    // Extract mobile responsiveness data
    const performanceScore = Math.round((lhr.categories.performance?.score || 0) * 100);
    const mobileIssues = Object.values(lhr.audits)
      .filter(audit => 
        audit.score !== null && 
        audit.score < 0.5 && 
        audit.group === 'load-opportunities'
      )
      .map(audit => ({
        id: audit.id,
        title: audit.title,
        description: audit.description
      }));

    // Extract security findings
    const bestPracticesScore = Math.round((lhr.categories['best-practices']?.score || 0) * 100);
    const securityFindings = Object.values(lhr.audits)
      .filter(audit => 
        audit.score !== null && 
        audit.score !== 1 && 
        audit.group === 'security'
      )
      .map(audit => ({
        id: audit.id,
        title: audit.title,
        description: audit.description
      }));

    console.log(`Lighthouse analysis completed. Performance: ${performanceScore}, Best Practices: ${bestPracticesScore}`);

    // 2. Run Puppeteer + axe-core for accessibility
    console.log('Launching Puppeteer for accessibility analysis...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Inject axe-core
    await page.addScriptTag({
      content: axeCore.source
    });
    
    // Run axe analysis
    const accessibilityResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore - axe is injected globally
        window.axe.run((err: any, results: any) => {
          if (err) {
            resolve({ violations: [] });
          } else {
            resolve(results);
          }
        });
      });
    });

    await browser.close();
    console.log(`Accessibility analysis completed. Found ${(accessibilityResults as any).violations?.length || 0} violations`);

    // 3. Fetch response headers
    console.log('Fetching response headers...');
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0; +https://websiteanalyzer.com/bot)',
      },
    });

    const headerChecks = {
      hsts: response.headers.get('strict-transport-security') || 'missing',
      csp: response.headers.get('content-security-policy') || 'missing',
      frameOptions: response.headers.get('x-frame-options') || 'missing'
    };

    console.log('Header analysis completed');

    // Return the structured result
    const result: AnalysisResult = {
      mobileResponsiveness: {
        score: performanceScore,
        issues: mobileIssues
      },
      securityScore: {
        grade: mapScoreToGrade(bestPracticesScore),
        findings: securityFindings
      },
      accessibility: {
        violations: (accessibilityResults as any).violations || []
      },
      headerChecks
    };

    console.log('Analysis completed successfully');
    return result;

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return fallback data on error
    return {
      mobileResponsiveness: {
        score: 0,
        issues: []
      },
      securityScore: {
        grade: 'F',
        findings: []
      },
      accessibility: {
        violations: []
      },
      headerChecks: {
        hsts: 'error',
        csp: 'error',
        frameOptions: 'error'
      }
    };
  }
}

// Export for testing purposes
export { mapScoreToGrade };
