import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

const router = Router();

const handleCreateScan = async (req: any, res: any) => {
  console.log('🔔 /api/scans', req.body);
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      console.warn("⚠️ Missing url in request body");
      return res.status(400).json({ error: "url is required" });
    }

    const normalizedUrl = normalizeUrl(url);
    console.log('🌐 Normalized URL:', normalizedUrl);

    const [{ scan_id }] = await sql/*sql*/`
      insert into public.scans (url)
      values (${normalizedUrl})
      returning id as scan_id`;
    console.log('✅ scan inserted', { scan_id, url: normalizedUrl });

    const taskTypes = ['tech', 'colors', 'seo', 'perf'];
    const tasks = taskTypes.map((type) => ({
      scan_id,
      type,
      status: 'queued',
      created_at: new Date().toISOString(),
    }));
    await sql/*sql*/`insert into public.scan_tasks ${sql(tasks)}`;
    console.log('🆕 tasks queued 4 for scan', scan_id);

    res.status(201).json({ scan_id });
  } catch (err) {
    console.error('❌ scan route error:', err);
    res.status(500).json({ error: 'failed to create scan' });
  }
};

router.post('/', handleCreateScan);

router.get('/:scanId/status', async (req: any, res: any) => {
  const { scanId } = req.params as { scanId: string };
  console.log('🔔 GET status for', scanId);
  try {
    const rows = await sql/*sql*/`
      select status, progress, started_at, finished_at, error
      from public.scan_status
      where scan_id = ${scanId}
      limit 1`;
    if (!rows.length) {
      return res.status(404).json({ error: 'status not found' });
    }
    const row = rows[0] as any;
    res.json({
      status: row.status,
      progress: row.progress,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      error: row.error,
    });
  } catch (err) {
    console.error('❌ status route error:', err);
    res.status(500).json({ error: 'failed to fetch status' });
  }
});

router.get('/:scanId/task/:type', async (req: any, res: any) => {
  const { scanId, type } = req.params as { scanId: string; type: string };
  console.log('🔔 GET task', type, 'for', scanId);
  try {
    const rows = await sql/*sql*/`
      select task_id, status, payload, created_at
      from public.scan_tasks
      where scan_id = ${scanId} and type = ${type}
      limit 1`;
    if (!rows.length) {
      return res.status(404).json({ error: 'task not found' });
    }
    const row = rows[0] as any;
    res.json({
      taskId: row.task_id,
      status: row.status,
      payload: row.payload,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('❌ task route error:', err);
    res.status(500).json({ error: 'failed to fetch task' });
  }
});

export default router;
