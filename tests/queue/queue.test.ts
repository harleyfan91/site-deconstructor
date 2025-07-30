/**
 * Queue system tests
 * Tests concurrency control and per-domain throttling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { queuePlaywrightTask, getQueueStats, clearQueue } from '../../server/lib/queue';

// Mock function for testing
const mockTask = vi.fn();

describe('Playwright Queue System', () => {
  beforeEach(() => {
    clearQueue();
      vi.clearAllMocks();
  });

  afterEach(() => {
    clearQueue();
  });

  it('should limit concurrency to maximum of 1 task', async () => {
    const taskPromises: Promise<any>[] = [];
    let activeCount = 0;
    let maxActiveCount = 0;

    // Create 10 tasks that track concurrency
    for (let i = 0; i < 10; i++) {
      const promise = queuePlaywrightTask(
        `https://example${i}.com`,
        async () => {
          activeCount++;
          maxActiveCount = Math.max(maxActiveCount, activeCount);
          
          // Simulate work
          await new Promise(resolve => setTimeout(resolve, 100));
          
          activeCount--;
          return `result-${i}`;
        },
        'concurrency-test'
      );
      taskPromises.push(promise);
    }

    // Wait for all tasks to complete
    await Promise.all(taskPromises);

    // Should never have more than 1 concurrent task
    expect(maxActiveCount).toBeLessThanOrEqual(1);
  });

  it('should reuse promises for same domain', async () => {
    let taskCount = 0;

    // Create multiple tasks for the same domain
    const promises = [
      queuePlaywrightTask('https://example.com', async () => {
        taskCount++;
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result1';
      }, 'domain-test'),
      queuePlaywrightTask('https://example.com', async () => {
        taskCount++;
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result2';
      }, 'domain-test'),
      queuePlaywrightTask('https://example.com', async () => {
        taskCount++;
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result3';
      }, 'domain-test')
    ];

    const results = await Promise.all(promises);

    // All promises should return the same result (from the first task)
    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
    
    // Only one task should have actually executed
    expect(taskCount).toBe(1);
  });

  it('should handle different domains independently', async () => {
    const tasks = [
      queuePlaywrightTask('https://domain1.com', async () => 'result1', 'multi-domain-test'),
      queuePlaywrightTask('https://domain2.com', async () => 'result2', 'multi-domain-test'),
      queuePlaywrightTask('https://domain3.com', async () => 'result3', 'multi-domain-test')
    ];

    const results = await Promise.all(tasks);

    expect(results).toEqual(['result1', 'result2', 'result3']);
  });

  it('should provide accurate queue statistics', async () => {
    const slowTask = queuePlaywrightTask(
      'https://slow.com',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'slow-result';
      },
      'stats-test'
    );

    // Check stats while task is running
    const stats = getQueueStats();
    expect(stats.concurrency).toBe(1);
    expect(stats.activeDomains).toContain('slow.com');

    await slowTask;

    // Check stats after completion
    const finalStats = getQueueStats();
    expect(finalStats.activeDomains).not.toContain('slow.com');
  });

  it.skip('should handle task errors gracefully', async () => {
    const errorTask = queuePlaywrightTask(
      'https://error.com',
      async () => {
        throw new Error('Task failed');
      },
      'error-test'
    );

    await expect(errorTask).rejects.toThrow('Task failed');

    // Domain should be cleaned up even after error
    const stats = getQueueStats();
    expect(stats.activeDomains).not.toContain('error.com');
  });

  it('should handle URL parsing edge cases', async () => {
    // Test with invalid URL
    const invalidUrlTask = queuePlaywrightTask(
      'not-a-url',
      async () => 'result',
      'edge-case-test'
    );

    const result = await invalidUrlTask;
    expect(result).toBe('result');
  });

  it.skip('should timeout tasks that exceed timeout limit', async () => {
    // Create a task that takes longer than the 60s timeout
    const timeoutTask = queuePlaywrightTask(
      'https://timeout.com',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 65000)); // 65 seconds
        return 'should-not-complete';
      },
      'timeout-test'
    );

    // Should reject due to timeout
    await expect(timeoutTask).rejects.toThrow();
  }, 70000); // Give Jest a bit more time than the task timeout

  it('should clear queue and domain promises', () => {
    // Add some tasks
    queuePlaywrightTask('https://test1.com', async () => 'result', 'clear-test');
    queuePlaywrightTask('https://test2.com', async () => 'result', 'clear-test');

    const beforeStats = getQueueStats();
    expect(beforeStats.size).toBeGreaterThan(0);

    clearQueue();

    const afterStats = getQueueStats();
    expect(afterStats.size).toBe(0);
    expect(afterStats.activeDomains).toHaveLength(0);
  });
});