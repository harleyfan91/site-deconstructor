import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../server/db.js', () => ({
  sql: vi.fn(async (_strings: TemplateStringsArray, ...values: any[]) => ({
    rows: [
      {
        id: 'test-id',
        url: values[0],
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  }))
}));

let app: express.Express;

beforeAll(async () => {
  const router = (await import('../../server/routes/scans.ts')).default;
  app = express();
  app.use(express.json());
  app.use(router);
});

describe('POST /api/scans', () => {
  it('should return 201 and inserted scan', async () => {
    const res = await request(app)
      .post('/api/scans')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url', 'https://example.com');
  });
});
