export async function runPerf(url: string) {
  console.log(`⚡ Running performance analysis for: ${url}`);
  
  // Simulate processing time (3-5 seconds for performance testing)
  await new Promise(r => setTimeout(r, Math.random() * 2000 + 3000));
  
  // Return fake performance analysis data
  return {
    type: "perf",
    url,
    timestamp: new Date().toISOString(),
    score: 92,
    coreWebVitals: {
      lcp: 2.1, // Largest Contentful Paint (seconds)
      fid: 95,  // First Input Delay (milliseconds)
      cls: 0.08 // Cumulative Layout Shift
    },
    metrics: {
      firstContentfulPaint: 1.2,
      speedIndex: 1.8,
      timeToInteractive: 2.4,
      totalBlockingTime: 150,
      cumulativeLayoutShift: 0.08
    },
    opportunities: [
      {
        title: "Eliminate render-blocking resources",
        description: "Resources are blocking the first paint of your page.",
        savings: "0.3s",
        impact: "medium"
      },
      {
        title: "Properly size images", 
        description: "Serve images that are appropriately-sized to save cellular data.",
        savings: "150KB",
        impact: "low"
      }
    ],
    diagnostics: [
      {
        title: "Minimize main thread work",
        description: "Consider reducing the time spent parsing, compiling and executing JS.",
        value: "2.1s",
        status: "passed"
      },
      {
        title: "Avoid enormous network payloads",
        description: "Large network payloads cost users real money.",
        value: "1.2MB",
        status: "passed"
      }
    ],
    loadTimes: {
      desktop: 1.8,
      mobile: 2.4
    },
    mobileOptimized: true
  };
}