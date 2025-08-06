import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

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

export default router;
