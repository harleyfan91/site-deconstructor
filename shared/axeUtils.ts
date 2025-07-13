/**
 * Axe-core utilities for accessibility analysis
 * Provides helpers for processing axe-core results
 */

export interface ColorContrastReport {
  element: string;
  fg: string;
  bg: string;
  ratio: number;
  expectedRatio: number;
  suggestedColor?: string;
  severity: string;
  recommendation: string;
}

/**
 * Extract color contrast report from axe-core violations
 * @param violations Array of axe-core violations
 * @returns Array of contrast issues with suggestions
 */
export function getColorContrastReport(violations: any[]): ColorContrastReport[] {
  const contrastViolations = violations.filter(v => v.id === 'color-contrast');
  
  return contrastViolations.flatMap(violation =>
    violation.nodes.map(node => {
      const target = Array.isArray(node.target) ? node.target.join(' ') : node.target;
      
      // Parse colors from the violation data
      let textColor = '#000000';
      let backgroundColor = '#ffffff';
      let ratio = 1;
      let expectedRatio = 4.5;
      let suggestedColor: string | undefined;
      
      if (node.any && node.any[0] && node.any[0].data) {
        const data = node.any[0].data;
        textColor = data.fgColor || textColor;
        backgroundColor = data.bgColor || backgroundColor;
        ratio = data.contrastRatio || ratio;
        expectedRatio = data.expectedContrastRatio || expectedRatio;
        
        // Extract suggested color if available
        if (data.contrastSuggestions && data.contrastSuggestions.length > 0) {
          suggestedColor = data.contrastSuggestions[0];
        }
      }

      const report: ColorContrastReport = {
        element: target,
        fg: textColor,
        bg: backgroundColor,
        ratio: Math.round(ratio * 100) / 100,
        expectedRatio,
        severity: violation.impact,
        recommendation: `Increase contrast ratio to at least ${expectedRatio}:1`
      };
      
      if (suggestedColor) {
        report.suggestedColor = suggestedColor;
        report.recommendation += ` - suggested color: ${suggestedColor}`;
      }
      
      return report;
    })
  );
}

/**
 * Process axe-core results into a standardized format
 * @param axeResults Raw results from axe-core
 * @returns Processed accessibility analysis
 */
export function processAxeResults(axeResults: any) {
  const violations = axeResults.violations || [];
  const passes = axeResults.passes || [];
  
  const contrastReport = getColorContrastReport(violations);
  
  const totalRules = passes.length + violations.length;
  const failedRules = violations.length;
  const passedRules = passes.length;
  const score = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 0;
  
  return {
    violations: violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((node: any) => ({
        target: Array.isArray(node.target) ? node.target : [node.target],
        html: node.html,
        failureSummary: node.failureSummary || ''
      }))
    })),
    contrastIssues: contrastReport,
    passedRules,
    failedRules,
    score
  };
}