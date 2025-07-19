/**
 * Centralized queue system for Playwright operations
 * Provides concurrency control and per-domain throttling
 */

import PQueue from 'p-queue';

/**
 * Global queue instance with bounded concurrency
 */
export const playwrightQueue = new PQueue({ 
  concurrency: 3,
  timeout: 60000, // 60 second timeout per task
  throwOnTimeout: true
});

/**
 * Per-domain promise tracker to prevent simultaneous scrapes of the same host
 */
const domainPromises = new Map<string, Promise<any>>();

/**
 * Extract domain from URL for throttling
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url; // Fallback to full URL if parsing fails
  }
}

/**
 * Queue a Playwright operation with per-domain throttling
 * Ensures only one operation per domain runs at a time
 */
export async function queuePlaywrightTask<T>(
  url: string, 
  taskFn: () => Promise<T>,
  taskName: string = 'playwright-task'
): Promise<T> {
  const domain = extractDomain(url);
  const taskId = `${taskName}-${domain}`;
  
  // Check if there's already a running task for this domain
  const existingPromise = domainPromises.get(domain);
  if (existingPromise) {
    console.log(`⏳ Domain ${domain} already has a running task, waiting...`);
    return existingPromise;
  }
  
  // Create new task promise
  const taskPromise = playwrightQueue.add(async () => {
    console.log(`🎭 Starting ${taskName} for ${domain} (queue size: ${playwrightQueue.size})`);
    const startTime = Date.now();
    
    try {
      const result = await taskFn();
      const duration = Date.now() - startTime;
      console.log(`✅ Completed ${taskName} for ${domain} in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Failed ${taskName} for ${domain} after ${duration}ms:`, error.message);
      throw error;
    }
  }, { 
    priority: 0,
    throwOnTimeout: true
  });
  
  // Track the promise for this domain
  domainPromises.set(domain, taskPromise);
  
  // Clean up when completed (success or failure)
  taskPromise.finally(() => {
    domainPromises.delete(domain);
    console.log(`🧹 Cleaned up task for ${domain}, remaining in queue: ${playwrightQueue.size}`);
  });
  
  return taskPromise;
}

/**
 * Get current queue statistics
 */
export function getQueueStats() {
  return {
    size: playwrightQueue.size,
    pending: playwrightQueue.pending,
    concurrency: playwrightQueue.concurrency,
    activeDomains: Array.from(domainPromises.keys())
  };
}

/**
 * Clear all queued tasks (for testing/emergency)
 */
export function clearQueue() {
  playwrightQueue.clear();
  domainPromises.clear();
  console.log('🗑️ Queue cleared');
}