/**
 * Tests for axe-core utilities
 */
const assert = require('node:assert');
const { getColorContrastReport, processAxeResults } = require('../shared/axeUtils.ts');

console.log('Testing axe-core utilities...');

// Mock axe results with color contrast violations
const mockAxeResults = {
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must have sufficient color contrast',
      help: 'Elements must have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      nodes: [
        {
          target: ['#main-heading'],
          html: '<h1 id="main-heading">Welcome</h1>',
          any: [
            {
              data: {
                fgColor: '#999999',
                bgColor: '#ffffff',
                contrastRatio: 2.85,
                expectedContrastRatio: 4.5,
                contrastSuggestions: ['#767676']
              }
            }
          ],
          failureSummary: 'Fix any of the following: Element has insufficient color contrast'
        }
      ]
    },
    {
      id: 'heading-order',
      impact: 'moderate',
      description: 'Heading levels should only increase by one',
      help: 'Heading levels should only increase by one',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
      nodes: [
        {
          target: ['h3'],
          html: '<h3>Subheading</h3>',
          failureSummary: 'Fix any of the following: Heading order invalid'
        }
      ]
    }
  ],
  passes: [
    {
      id: 'image-alt',
      impact: null,
      description: 'Images must have alternate text',
      help: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt'
    },
    {
      id: 'label',
      impact: null,
      description: 'Form elements must have labels',
      help: 'Form elements must have labels',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label'
    }
  ]
};

// Test color contrast report extraction
const contrastReport = getColorContrastReport(mockAxeResults.violations);
assert.strictEqual(contrastReport.length, 1, 'Should extract one contrast issue');

const contrastIssue = contrastReport[0];
assert.strictEqual(contrastIssue.element, '#main-heading', 'Should extract correct element');
assert.strictEqual(contrastIssue.fg, '#999999', 'Should extract foreground color');
assert.strictEqual(contrastIssue.bg, '#ffffff', 'Should extract background color');
assert.strictEqual(contrastIssue.ratio, 2.85, 'Should extract contrast ratio');
assert.strictEqual(contrastIssue.expectedRatio, 4.5, 'Should extract expected ratio');
assert.strictEqual(contrastIssue.severity, 'serious', 'Should extract severity');
assert.strictEqual(contrastIssue.suggestedColor, '#767676', 'Should extract suggested color');
assert.ok(contrastIssue.recommendation.includes('#767676'), 'Should include suggested color in recommendation');

// Test processAxeResults
const processedResults = processAxeResults(mockAxeResults);
assert.strictEqual(processedResults.violations.length, 2, 'Should process all violations');
assert.strictEqual(processedResults.passedRules, 2, 'Should count passed rules');
assert.strictEqual(processedResults.failedRules, 2, 'Should count failed rules');
assert.strictEqual(processedResults.score, 50, 'Should calculate score correctly (2 passed / 4 total = 50%)');

// Test with violations that have no contrast data
const processedViolation = processedResults.violations.find(v => v.id === 'color-contrast');
assert.ok(processedViolation, 'Should include color-contrast violation');
assert.strictEqual(processedViolation.impact, 'serious', 'Should preserve impact');
assert.strictEqual(processedViolation.description, 'Elements must have sufficient color contrast', 'Should preserve description');

// Test with empty results
const emptyResults = processAxeResults({ violations: [], passes: [] });
assert.strictEqual(emptyResults.violations.length, 0, 'Should handle empty violations');
assert.strictEqual(emptyResults.passedRules, 0, 'Should handle empty passes');
assert.strictEqual(emptyResults.score, 0, 'Should return 0 score for no rules');

// Test contrast report with no contrast violations
const noContrastViolations = [
  {
    id: 'heading-order',
    impact: 'moderate',
    nodes: []
  }
];
const emptyContrastReport = getColorContrastReport(noContrastViolations);
assert.strictEqual(emptyContrastReport.length, 0, 'Should return empty array for no contrast violations');

// Test contrast report with missing data
const missingDataViolations = [
  {
    id: 'color-contrast',
    impact: 'serious',
    nodes: [
      {
        target: ['#test'],
        html: '<div id="test">Test</div>',
        any: [{ data: {} }] // Missing color data
      }
    ]
  }
];
const missingDataReport = getColorContrastReport(missingDataViolations);
assert.strictEqual(missingDataReport.length, 1, 'Should handle missing data gracefully');
assert.strictEqual(missingDataReport[0].fg, '#000000', 'Should use default foreground color');
assert.strictEqual(missingDataReport[0].bg, '#ffffff', 'Should use default background color');

console.log('✅ All axe utils tests passed');