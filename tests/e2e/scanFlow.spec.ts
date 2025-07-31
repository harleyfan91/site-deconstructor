import { test, expect } from '@playwright/test';

test.describe('Scan Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase auth to simulate logged-in user
    await page.route('**/auth/**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'fake-jwt-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock API endpoints
    await page.route('**/api/scans', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            scanId: 'test-scan-123',
            url: 'https://example.com',
            status: 'queued'
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/scans/*/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'complete',
          progress: 100,
          scanId: 'test-scan-123',
          url: 'https://example.com'
        })
      });
    });

    await page.route('**/api/scans/*/task/*', async (route) => {
      const taskType = route.request().url().split('/').pop();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: taskType,
          status: 'complete',
          data: {
            tech: { technologies: ['React', 'TypeScript'] },
            colors: { colors: [{ hex: '#007ACC', name: 'Blue' }] },
            seo: { score: 85, title: 'Example Site' },
            perf: { score: 90, loadTime: 1.2 }
          }[taskType] || {}
        })
      });
    });
  });

  test('full scan flow from URL input to results', async ({ page }) => {
    // Start from landing page
    await page.goto('/');
    
    // Wait for page to load
    await expect(page.getByText('Site Deconstructor')).toBeVisible();
    
    // Enter URL and submit
    await page.getByPlaceholder('Enter website URL').fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();
    
    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard\/test-scan-123/);
    
    // Check that progress bar is visible
    await expect(page.getByText('Analysis Progress')).toBeVisible();
    
    // Wait for task cards to load
    await expect(page.getByText('TECH')).toBeVisible();
    await expect(page.getByText('COLORS')).toBeVisible();
    await expect(page.getByText('SEO')).toBeVisible();
    await expect(page.getByText('PERF')).toBeVisible();
    
    // Verify scan completion
    await expect(page.getByText('Complete')).toBeVisible();
  });

  test('login flow', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill in email
    await page.getByLabel('Email address').fill('test@example.com');
    
    // Submit form
    await page.getByRole('button', { name: 'Send magic link' }).click();
    
    // Should show success message
    await expect(page.getByText('Check your inbox!')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('panel state persistence', async ({ page }) => {
    // Mock a scan with UI data
    await page.route('**/api/scans/*/task/colors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'colors',
          status: 'complete',
          data: {
            colors: [
              { hex: '#007ACC', name: 'Primary Blue', usage: 'text', count: 15 },
              { hex: '#333333', name: 'Dark Gray', usage: 'background', count: 8 }
            ]
          }
        })
      });
    });
    
    // Navigate to panel test page
    await page.goto('/panel-test?scanId=test-panel');
    
    // Click UI Analysis tab
    await page.getByRole('tab', { name: 'UI Analysis' }).click();
    
    // Expand Color Extraction section
    await page.getByText('Color Extraction').click();
    
    // Verify colors are visible
    await expect(page.getByText('#007ACC')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Color Extraction section should still be expanded
    await page.getByRole('tab', { name: 'UI Analysis' }).click();
    await expect(page.getByText('#007ACC')).toBeVisible();
  });

  test('progress bar updates', async ({ page }) => {
    let progressValue = 0;
    
    // Mock progressive status updates
    await page.route('**/api/scans/*/status', async (route) => {
      progressValue += 25;
      const status = progressValue >= 100 ? 'complete' : 'running';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status,
          progress: Math.min(progressValue, 100),
          scanId: 'test-scan-123'
        })
      });
    });
    
    await page.goto('/progress-test');
    
    // Create a new scan
    await page.getByRole('button', { name: 'Create New Scan' }).click();
    
    // Should redirect to dashboard and show progress
    await page.waitForURL(/\/dashboard\//);
    
    // Progress bar should be visible and updating
    await expect(page.getByText('Analysis Progress')).toBeVisible();
    
    // Wait for completion
    await expect(page.getByText('Complete')).toBeVisible({ timeout: 10000 });
  });
});