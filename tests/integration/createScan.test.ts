import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const insertedTasks: any[] = [];

vi.mock('../../server/db.js', () => ({
  sql: vi.fn((strings: any, ...values: any[]) => {
    if (Array.isArray(strings) && strings.raw) {
      const query = strings.join('');
      if (query.includes('insert into public.scans')) {
        return Promise.resolve([{ id: 'test-scan-id' }]);
      }
      if (query.includes('insert into public.scan_tasks')) {
        const tasksArg = values[0];
        insertedTasks.push(...tasksArg);
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    }
    // sql(tasks) -> just return the tasks array synchronously
    return strings;
  })
}));

let app: express.Express;

beforeAll(async () => {
  process.env.ANALYSIS_MODE = 'queued';
  const router = (await import('../../server/routes/scans.ts')).default;
  app = express();
  app.use(express.json());
  app.use(router);
});

describe('POST /api/scans', () => {
  it('creates scan and queues four tasks', async () => {
    const res = await request(app)
      .post('/api/scans')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('scan_id', 'test-scan-id');
    expect(insertedTasks).toHaveLength(4);
    insertedTasks.forEach(t => expect(t.status).toBe('queued'));
  });
});
