import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Wappalyzer from 'wappalyzer';
import { createClient } from '@supabase/supabase-js';
import { extractColors, type ColorResult } from './lib/color-extraction';

interface LabMetrics {
  pageLoadTime: number;
  lcpMs: number;
  inpMs: number;
  cls: number;
}

const PSI_CACHE_TTL = 1000 * 60 * 5;
const psiCache = new Map<string, { data: any; expires: number }>();

async function fetchPSIData(url: string, strategy: 'mobile' | 'desktop'): Promise<any> {
  const key = `${url}_${strategy}`;
  const cached = psiCache.get(key);
  const now = Date.now();
  if (cached && cached.expires > now) return cached.data;
  const apiKey = process.env.PSI_API_KEY || process.env.PAGESPEED_API_KEY;
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}` +
    (apiKey ? `&key=${apiKey}` : '');
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`PSI request failed: ${resp.status}`);
  const json = await resp.json();
  psiCache.set(key, { data: json, expires: now + PSI_CACHE_TTL });
  return json;
}

function extractLabMetrics(json: any): LabMetrics {
  const audits = json?.lighthouseResult?.audits ?? {};
  return {
    pageLoadTime: audits['metrics']?.details?.items?.[0]?.observedLoad ?? 0,
    lcpMs: audits['largest-contentful-paint']?.numericValue ?? 0,
    inpMs: audits['total-blocking-time']?.numericValue ?? 0,
    cls: audits['cumulative-layout-shift']?.numericValue ?? 0,
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

// Helper function to extract image URLs from HTML
function extractImageUrls(html: string): string[] {
  const imageUrls: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // Convert relative URLs to absolute URLs if needed
    if (src.startsWith('//')) {
      imageUrls.push(`https:${src}`);
    } else if (src.startsWith('/')) {
      // For relative paths, we'd need the base URL, for now just add as-is
      imageUrls.push(src);
    } else if (src.startsWith('http')) {
      imageUrls.push(src);
    }
  }
  
  return imageUrls;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Color extraction API route
  app.post('/api/colors', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log(`Extracting colors for: ${url}`);
      
      const colors = await extractColors(url);
      
      console.log(`Extracted ${colors.length} unique colors`);
      res.json(colors);
      
    } catch (error) {
      console.error('Color extraction failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          return res.status(504).json({ error: 'Request timeout while extracting colors' });
        }
        if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
          return res.status(400).json({ error: 'Unable to access the provided URL' });
        }
      }
      
      res.status(500).json({ error: 'Color extraction failed' });
    }
  });

  // Analysis API route
  app.get("/api/analyze", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL parameter is required" });
      }
      const mobileData = extractLabMetrics(await fetchPSIData(url, "mobile"));
      const desktopData = extractLabMetrics(await fetchPSIData(url, "desktop"));
      res.json({ url, data: { overview: { mobile: mobileData, desktop: desktopData } } });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
