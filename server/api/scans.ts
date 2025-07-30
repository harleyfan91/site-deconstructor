import { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { analysisCache, scanStatus, scanTasks } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function (app: FastifyInstance) {
  // GET scan status
  app.get('/api/scans/:scanId/status', async (req, reply) => {
    const { scanId } = req.params as { scanId: string };
    const status = await db
      .select({ status: scanStatus.status, progress: scanStatus.progress })
      .from(scanStatus)
      .where(eq(scanStatus.scanId, scanId))
      .limit(1);
    return reply.send(status[0] || {});
  });

  // GET task data (cache-first)
  app.get('/api/scans/:scanId/task/:type', async (req, reply) => {
    const { scanId, type } = req.params as { scanId: string; type: string };
    const cached = await db
      .select()
      .from(analysisCache)
      .where(and(eq(analysisCache.scanId, scanId), eq(analysisCache.type, type)))
      .limit(1);
    if (cached.length) return reply.send(cached[0].auditJson);

    // fallback: task status
    const task = await db
      .select({ status: scanTasks.status })
      .from(scanTasks)
      .where(and(eq(scanTasks.scanId, scanId), eq(scanTasks.type, type)))
      .limit(1);
    return reply.code(202).send({ status: task[0]?.status || 'not_found' });
  });
}
