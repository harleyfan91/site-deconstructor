/**
 * Performance regression test for analysis endpoints
 * Tests full analysis response times and data completeness
 */

// Using built-in fetch (Node.js 18+)

// Test configuration
const TEST_URL = 'https://example.com';
const SERVER_BASE = process.env.TEST_SERVER_BASE || 'http://localhost:5000';
const QUICK_TIMEOUT = 5000; // 5 seconds for performance endpoints
const FULL_TIMEOUT = 30000; // 30 seconds for full analysis

// Network throttling simulation
const throttledFetch = async (url, options = {}) => {
  const delay = Math.random() * 200 + 100; // 100-300ms delay
  await new Promise(resolve => setTimeout(resolve, delay));
  return fetch(url, options);
};

describe('Analysis Performance Tests', () => {
  test('Main analysis returns complete data', async () => {
    const startTime = Date.now();
    
    const response = await throttledFetch(
      `${SERVER_BASE}/api/analyze/full?url=${encodeURIComponent(TEST_URL)}`,
      { timeout: FULL_TIMEOUT }
    );
    
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    // Performance assertions
    expect(response.status).toBe(200);
    
    // Data completeness assertions
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('url', TEST_URL);
    expect(data).toHaveProperty('status', 'complete');
    expect(data).toHaveProperty('coreWebVitals');
    expect(data).toHaveProperty('securityHeaders');
    expect(data).toHaveProperty('data.overview');
    expect(data).toHaveProperty('data.ui');
    expect(data).toHaveProperty('data.performance');
    expect(data).toHaveProperty('data.seo');
    expect(data).toHaveProperty('data.technical');
    
    // Performance data should be present
    expect(data.data.overview).toHaveProperty('pageLoadTime');
    expect(data.data.overview).toHaveProperty('coreWebVitals');
    expect(typeof data.data.overview.pageLoadTime).toBe('number');
    
    console.log(`🔍 Analysis completed in ${duration}ms`);
  }, FULL_TIMEOUT + 1000);

  test('Legacy endpoint maintains backward compatibility', async () => {
    const startTime = Date.now();
    
    const response = await throttledFetch(
      `${SERVER_BASE}/api/analyze?url=${encodeURIComponent(TEST_URL)}`,
      { timeout: FULL_TIMEOUT }
    );
    
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    // Should return same structure as full analysis
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'complete');
    expect(data).toHaveProperty('data.overview');
    expect(data).toHaveProperty('data.ui');
    expect(data).toHaveProperty('data.performance');
    
    console.log(`📍 Legacy analysis completed in ${duration}ms`);
  }, FULL_TIMEOUT + 1000);

  test('Cache performance - second request should be faster', async () => {
    // First request (cache miss)
    const firstStart = Date.now();
    const firstResponse = await throttledFetch(
      `${SERVER_BASE}/api/analyze/full?url=${encodeURIComponent(TEST_URL)}`
    );
    const firstDuration = Date.now() - firstStart;
    expect(firstResponse.status).toBe(200);
    
    // Second request (cache hit)
    const secondStart = Date.now();
    const secondResponse = await throttledFetch(
      `${SERVER_BASE}/api/analyze/full?url=${encodeURIComponent(TEST_URL)}`
    );
    const secondDuration = Date.now() - secondStart;
    expect(secondResponse.status).toBe(200);
    
    // Second request should be significantly faster
    const speedImprovement = firstDuration / secondDuration;
    expect(speedImprovement).toBeGreaterThan(1.5);
    
    console.log(`⚡ Cache speedup: ${speedImprovement.toFixed(2)}x faster (${firstDuration}ms → ${secondDuration}ms)`);
  }, FULL_TIMEOUT * 2);

  test('Concurrent requests handling', async () => {
    const testUrls = [
      'https://example.com',
      'https://httpbin.org',
      'https://jsonplaceholder.typicode.com'
    ];
    
    const startTime = Date.now();
    
    // Fire multiple requests simultaneously  
    const promises = testUrls.map(url =>
      throttledFetch(`${SERVER_BASE}/api/analyze/full?url=${encodeURIComponent(url)}`)
    );
    
    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    // All requests should succeed
    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
      console.log(`📊 Concurrent request ${index + 1} completed`);
    });
    
    // Should complete within reasonable time despite concurrency
    expect(duration).toBeLessThan(QUICK_TIMEOUT * 2);
    
    console.log(`🚀 ${testUrls.length} concurrent requests completed in ${duration}ms`);
  }, FULL_TIMEOUT);
});

// Helper function to run performance benchmarks
async function runBenchmark() {
  if (require.main === module) {
    console.log('🧪 Running performance benchmarks...');
    console.log(`Testing against: ${SERVER_BASE}`);
    console.log(`Test URL: ${TEST_URL}`);
    console.log('');
    
    // You can run this file directly for quick performance testing
    try {
      // Test quick analysis
      console.log('Testing quick analysis...');
      const quickStart = Date.now();
      const quickRes = await fetch(`${SERVER_BASE}/api/analyze/quick?url=${encodeURIComponent(TEST_URL)}`);
      const quickDuration = Date.now() - quickStart;
      console.log(`✅ Quick analysis: ${quickDuration}ms`);
      
      // Test full analysis
      console.log('Testing full analysis...');
      const fullStart = Date.now();
      const fullRes = await fetch(`${SERVER_BASE}/api/analyze/full?url=${encodeURIComponent(TEST_URL)}`);
      const fullDuration = Date.now() - fullStart;
      console.log(`🔍 Full analysis: ${fullDuration}ms`);
      
      console.log('');
      console.log(`📈 Performance ratio: ${(fullDuration / quickDuration).toFixed(2)}x`);
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
    }
  }
}

if (require.main === module) {
  runBenchmark();
}

module.exports = { runBenchmark };