import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const router = Router();

const handleCreateScan = async (req: any, res: any) => {
  console.log('🔔 /api/scans hit', req.method, req.path, req.body);
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      console.warn("⚠️ Missing url in request body");
      return res.status(400).json({ error: "url is required" });
    }

    const normalized = normalizeUrl(url);
    console.log('🌐 Normalized URL:', normalized);

    const [{ id: scan_id }] = await sql/*sql*/`
      insert into public.scans (url, created_at)
      values (${normalized}, now())
      returning id`;
    console.log("✅ scan inserted", { scan_id, url: normalized });

    await sql/*sql*/`
      insert into public.scan_status (scan_id, status, created_at, updated_at)
      values (${scan_id}, 'queued', now(), now())`;
    console.log("📝 scan_status inserted", scan_id);

    const taskTypes = ["tech", "colors", "seo", "perf"];
    const tasks = taskTypes.map((type) => ({
      scan_id,
      type,
      status: "queued",
    }));
    console.log('📝 inserting tasks', tasks);
    await sql`insert into public.scan_tasks ${sql(tasks)}`;
    console.log("🆕 tasks queued", { scan_id, count: tasks.length });

    res.status(201).json({
      scan_id,
      status: "queued",
      url: normalized,
      task_types: taskTypes,
    });
  } catch (err) {
    console.error('❌ scan route error:', err);
    res.status(500).json({ error: 'failed to create scan' });
  }
};

router.post('/', handleCreateScan);
router.post('/api/scans', handleCreateScan);

export default router;
