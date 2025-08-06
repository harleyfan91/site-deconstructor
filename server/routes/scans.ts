import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const router = Router();

router.post("/", async (req, res) => {
  console.log("🔔 Route hit:", req.method, req.path, req.body);
  const { url } = req.body as { url?: string };
  if (!url) {
    console.warn("⚠️ Missing url in request body");
    return res.status(400).json({ error: "url is required" });
  }

  const normalized = normalizeUrl(url);

  let scan_id: string;
  try {
    const [{ id }] = await sql/*sql*/`
      insert into public.scans (url, created_at)
      values (${normalized}, now())
      returning id`;
    scan_id = id;
    console.log("✅ scan inserted", { scan_id, url: normalized });
  } catch (err) {
    console.error("❌ scan insert error:", err);
    return res.status(500).json({ error: "failed to insert scan" });
  }

  try {
    await sql/*sql*/`
      insert into public.scan_status (scan_id, status, created_at, updated_at)
      values (${scan_id}, 'queued', now(), now())`;
    console.log("📝 scan_status inserted", scan_id);
  } catch (err) {
    console.error("❌ scan_status insert error:", err);
    return res.status(500).json({ error: "failed to create scan status" });
  }

  const taskTypes = ["tech", "colors", "seo", "perf"];
  try {
    const tasks = taskTypes.map((type) => ({
      scan_id,
      type,
      status: "queued",
    }));
    console.log('📝 inserting tasks', tasks);
    await sql`insert into public.scan_tasks ${sql(tasks)}`;
    console.log("🆕 tasks queued", { scan_id, count: tasks.length });
  } catch (err) {
    console.error("❌ task insert error:", err);
    return res.status(500).json({ error: "failed to queue tasks" });
  }

  res.status(201).json({
    scan_id,
    status: "queued",
    url: normalized,
    task_types: taskTypes,
  });
});

export default router;
