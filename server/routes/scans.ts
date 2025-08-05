import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const router = Router();

router.post("/", async (req, res) => {
  console.log("🔔 /api/scans hit", req.body);
  const { url } = req.body as { url: string };
  const normalized = normalizeUrl(url);

  let scan_id: string;
  try {
    const [{ id }] = await sql/*sql*/`
      insert into public.scans (url, created_at)
      values (${normalized}, now())
      returning id`;
    scan_id = id;
    console.log("✅ scan inserted", scan_id);
  } catch (error) {
    console.error("❌ scan insert failed", error);
    return res.status(500).json({ error: "failed to insert scan" });
  }

  try {
    const taskTypes = ["tech", "colors", "seo", "perf"];
    const tasks = taskTypes.map((type) => ({
      scan_id,
      type,
      status: "queued",
    }));
    await sql`insert into public.scan_tasks ${sql(tasks)}`;
    console.log(`🆕 queued ${tasks.length} tasks for scan`, scan_id);
  } catch (error) {
    console.error("❌ task insert failed", error);
    return res.status(500).json({ error: "failed to queue tasks" });
  }

  res.status(201).json({ scan_id });
});

export default router;
