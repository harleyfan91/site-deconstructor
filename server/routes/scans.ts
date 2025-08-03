import { Router } from "express";
import { sql } from "../db.js";
import { normalizeUrl } from "../../shared/utils/normalizeUrl.js";

const router = Router();

router.post("/api/scans", async (req, res) => {
  console.log("🔔 /api/scans hit with body:", req.body);
  const { url } = req.body as { url: string };
  const normalized = normalizeUrl(url);
  const { rows } = await sql/*sql*/`
      insert into public.scans (url, created_at)
      values (${normalized}, now())
      returning id, url, created_at`;
  console.log("✅ scan inserted", rows[0]);
  res.status(201).json(rows[0]);
});

export default router;
