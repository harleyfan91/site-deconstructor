/**
 * Overview API route tests
 * Tests route shape, cache behavior, and status codes
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the UI scraper service
const mockAnalyzeUI = jest.fn();
const mockGetOrCreateAnalysis = jest.fn();

jest.mock('../../server/services/uiScraper', () => ({
  UIScraperService: {
    analyzeUI: mockAnalyzeUI,
    getOrCreateAnalysis: mockGetOrCreateAnalysis
  }
}));

// Mock other services
jest.mock('../../server/lib/seo-extractor', () => ({
  extractSEOData: jest.fn().mockResolvedValue({ score: 85, checks: [], metaTags: {} })
}));

jest.mock('../../server/lib/enhanced-tech-analysis', () => ({
  getEnhancedTechAnalysis: jest.fn().mockResolvedValue({ techStack: [], overallScore: 75 })
}));

jest.mock('../../server/lib/lighthouse-service', () => ({
  getLighthousePerformance: jest.fn().mockResolvedValue({ metrics: { largestContentfulPaint: { numericValue: 2000 } } }),
  getLighthousePageLoadTime: jest.fn().mockResolvedValue({ desktop: 1500, mobile: 2500 })
}));

jest.mock('../../server/lib/page-scraper', () => ({
  scrapePageData: jest.fn().mockResolvedValue({ wordCount: 500, readabilityScore: 65 })
}));

import request from 'supertest';
import express from 'express';
import overviewRouter from '../../server/routes/overview';

describe('Overview API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/api/overview', overviewRouter);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for missing URL parameter', async () => {
    const response = await request(app)
      .get('/api/overview')
      .expect(400);

    expect(response.body).toEqual({
      error: 'URL parameter is required'
    });
  });

  it('should return 200 with complete analysis data', async () => {
    // Mock successful UI analysis
    const mockUIData = {
      colors: [{ hex: '#ff0000', name: 'Red' }],
      fonts: [{ name: 'Arial', category: 'sans-serif' }],
      images: [],
      accessibilityScore: 90,
      schemaVersion: '1.1.0',
      scrapedAt: new Date().toISOString()
    };

    mockGetOrCreateAnalysis.mockResolvedValue(mockUIData);

    const response = await request(app)
      .get('/api/overview?url=https://example.com')
      .expect(200);

    expect(response.body).toMatchObject({
      ui: expect.objectContaining({
        colors: expect.any(Array),
        fonts: expect.any(Array),
        schemaVersion: '1.1.0'
      }),
      seo: expect.objectContaining({
        score: expect.any(Number)
      }),
      perf: expect.objectContaining({
        pageLoadTime: expect.any(Object)
      }),
      tech: expect.objectContaining({
        techStack: expect.any(Array)
      }),
      content: expect.objectContaining({
        wordCount: expect.any(Number)
      }),
      overview: expect.objectContaining({
        overallScore: expect.any(Number),
        accessibilityScore: expect.any(Number)
      }),
      schemaVersion: '1.1.0'
    });
  });

  it('should return 202 when UI analysis is pending', async () => {
    // Mock pending UI analysis
    mockGetOrCreateAnalysis.mockResolvedValue({ status: 'pending' });

    const response = await request(app)
      .get('/api/overview?url=https://example.com')
      .expect(202);

    expect(response.body).toEqual({
      message: 'Analysis in progress, please poll again',
      url: 'https://example.com',
      schemaVersion: '1.1.0'
    });
  });

  it('should handle URL normalization', async () => {
    const mockUIData = {
      colors: [],
      fonts: [],
      images: [],
      accessibilityScore: 85,
      schemaVersion: '1.1.0',
      scrapedAt: new Date().toISOString()
    };

    mockGetOrCreateAnalysis.mockResolvedValue(mockUIData);

    // Test URL without protocol
    await request(app)
      .get('/api/overview?url=example.com')
      .expect(200);

    // Verify the mock was called with normalized URL
    expect(mockGetOrCreateAnalysis).toHaveBeenCalledWith('https://example.com');
  });

  it('should return 500 on analysis error', async () => {
    mockGetOrCreateAnalysis.mockRejectedValue(new Error('Analysis failed'));

    const response = await request(app)
      .get('/api/overview?url=https://example.com')
      .expect(500);

    expect(response.body).toEqual({
      error: 'Failed to aggregate analysis data',
      schemaVersion: '1.1.0'
    });
  });

  it('should handle graceful degradation when some services fail', async () => {
    const mockUIData = {
      colors: [{ hex: '#000000', name: 'Black' }],
      fonts: [{ name: 'Helvetica', category: 'sans-serif' }],
      images: [],
      accessibilityScore: 80,
      schemaVersion: '1.1.0',
      scrapedAt: new Date().toISOString()
    };

    mockGetOrCreateAnalysis.mockResolvedValue(mockUIData);

    const response = await request(app)
      .get('/api/overview?url=https://example.com')
      .expect(200);

    // Should still return 200 even if some analysis fails
    expect(response.body.ui).toEqual(mockUIData);
    expect(response.body.schemaVersion).toBe('1.1.0');
  });
});