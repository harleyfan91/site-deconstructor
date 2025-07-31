/**
 * Integration tests for scan API endpoints
 * Tests the POST /api/scans, GET /api/scans/:id/status, and GET /api/scans/:id/task/:type endpoints
 */

import { beforeAll, afterAll, describe, expect, it } from 'vitest';

// Mock JWT for authentication
const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const baseUrl = 'http://localhost:5000';

describe('Scan API Endpoints', () => {
  let scanId: string;
  
  beforeAll(async () => {
    // Ensure server is running - this assumes the test runner starts the server
    // In a real scenario, you might want to start the server programmatically
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('POST /api/scans', () => {
    it('should create a new scan and return 201 with scan_id', async () => {
      const response = await fetch(`${baseUrl}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockJWT}`,
        },
        body: JSON.stringify({ url: 'https://example.com' }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('scan_id');
      expect(data).toHaveProperty('status', 'queued');
      expect(data).toHaveProperty('url', 'https://example.com');
      expect(data).toHaveProperty('task_types');
      expect(Array.isArray(data.task_types)).toBe(true);
      expect(data.task_types).toContain('tech');
      expect(data.task_types).toContain('colors');
      expect(data.task_types).toContain('seo');
      expect(data.task_types).toContain('perf');

      // Store scanId for subsequent tests
      scanId = data.scan_id;
      expect(typeof scanId).toBe('string');
      expect(scanId.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing URL', async () => {
      const response = await fetch(`${baseUrl}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockJWT}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/scans/:id/status', () => {
    it('should return scan status with "queued" status', async () => {
      // Use the scanId from the previous test
      expect(scanId).toBeDefined();

      const response = await fetch(`${baseUrl}/api/scans/${scanId}/status`, {
        headers: {
          'Authorization': `Bearer ${mockJWT}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('scanId', scanId);
      expect(data).toHaveProperty('url', 'https://example.com');
      expect(data).toHaveProperty('status', 'queued');
      expect(data).toHaveProperty('progress');
      expect(typeof data.progress).toBe('number');
      expect(data.progress).toBeGreaterThanOrEqual(0);
      expect(data.progress).toBeLessThanOrEqual(100);
    });

    it('should return 404 for non-existent scan', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const response = await fetch(`${baseUrl}/api/scans/${nonExistentId}/status`, {
        headers: {
          'Authorization': `Bearer ${mockJWT}`,
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Scan not found');
    });
  });

  describe('GET /api/scans/:id/task/:type', () => {
    it('should return task data for each task type', async () => {
      expect(scanId).toBeDefined();
      
      const taskTypes = ['tech', 'colors', 'seo', 'perf'];
      
      for (const taskType of taskTypes) {
        const response = await fetch(`${baseUrl}/api/scans/${scanId}/task/${taskType}`, {
          headers: {
            'Authorization': `Bearer ${mockJWT}`,
          },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data).toHaveProperty('type', taskType);
        expect(data).toHaveProperty('status');
        expect(['queued', 'running', 'complete', 'failed']).toContain(data.status);
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('error');
        
        // For queued tasks, data should be null
        if (data.status === 'queued') {
          expect(data.data).toBeNull();
        }
      }
    });

    it('should return 404 for non-existent task', async () => {
      expect(scanId).toBeDefined();
      
      const response = await fetch(`${baseUrl}/api/scans/${scanId}/task/invalid-type`, {
        headers: {
          'Authorization': `Bearer ${mockJWT}`,
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 for non-existent scan', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const response = await fetch(`${baseUrl}/api/scans/${nonExistentId}/task/tech`, {
        headers: {
          'Authorization': `Bearer ${mockJWT}`,
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Task not found');
    });
  });

  describe('Integration test - Complete workflow', () => {
    it('should handle complete scan workflow', async () => {
      // Step 1: Create scan
      const createResponse = await fetch(`${baseUrl}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockJWT}`,
        },
        body: JSON.stringify({ url: 'https://google.com' }),
      });
      
      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      const workflowScanId = createData.scan_id;

      // Step 2: Check initial status
      const statusResponse = await fetch(`${baseUrl}/api/scans/${workflowScanId}/status`, {
        headers: { 'Authorization': `Bearer ${mockJWT}` },
      });
      
      expect(statusResponse.status).toBe(200);
      const statusData = await statusResponse.json();
      expect(statusData.status).toBe('queued');

      // Step 3: Check all task endpoints
      const taskTypes = ['tech', 'colors', 'seo', 'perf'];
      for (const taskType of taskTypes) {
        const taskResponse = await fetch(`${baseUrl}/api/scans/${workflowScanId}/task/${taskType}`, {
          headers: { 'Authorization': `Bearer ${mockJWT}` },
        });
        
        expect(taskResponse.status).toBe(200);
        const taskData = await taskResponse.json();
        expect(taskData.type).toBe(taskType);
        expect(taskData.status).toBe('queued');
      }
    });
  });
});