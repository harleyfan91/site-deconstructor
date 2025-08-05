import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const router = Router();

router.post("/api/scans", async (req, res) => {
  console.log("🔔 /api/scans hit", req.body);
  const { url } = req.body as { url: string };
  const normalized = normalizeUrl(url);

  // 1️⃣ insert scan
  const [{ id: scan_id }] = await sql/*sql*/`
    insert into public.scans (url, created_at)
    values (${normalized}, now())
    returning id`;
  console.log("✅ scan inserted", scan_id);

  // 2️⃣ queue four tasks
  const taskTypes = ["tech", "colors", "seo", "perf"];
  const tasks = taskTypes.map((type) => ({
    scan_id,
    type,
    status: "queued",
  }));
  await sql`insert into public.scan_tasks ${sql(tasks)}`;
  console.log(`🆕 queued ${tasks.length} tasks for scan`, scan_id);

  res.status(201).json({ scan_id });
});

export default router;
