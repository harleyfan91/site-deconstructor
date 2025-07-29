import { eq, and } from "drizzle-orm";
import { db } from '../server/db.js';
import * as schema from "../shared/schema.js";
import { runTech } from "./analysers/tech";
import { runColors } from "./analysers/colors";
import { runSeo } from "./analysers/seo";
import { runPerf } from "./analysers/perf";

// Task runners mapping
const runners: Record<string, (url: string) => Promise<any>> = {
  tech: runTech,
  colors: runColors,
  seo: runSeo,
  perf: runPerf,
};

async function generateUrlHash(url: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(url).digest('hex');
}

async function work() {
  console.log('🚀 Worker started - polling for queued tasks...');
  
  while (true) {
    try {
      // Get next queued task
      const tasks = await db
        .select()
        .from(schema.scanTasks)
        .where(eq(schema.scanTasks.status, "queued"))
        .orderBy(schema.scanTasks.taskId)
        .limit(1);

      if (!tasks.length) {
        // No tasks available, wait and continue
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      const task = tasks[0];
      console.log(`📋 Processing task: ${task.type} for scan ${task.scanId}`);

      // Mark task as running
      await db
        .update(schema.scanTasks)
        .set({ status: "running" })
        .where(eq(schema.scanTasks.taskId, task.taskId));

      try {
        // Get the URL from the scan record
        const scans = await db
          .select()
          .from(schema.scans)
          .where(eq(schema.scans.id, task.scanId!))
          .limit(1);

        if (!scans.length) {
          throw new Error(`Scan not found: ${task.scanId}`);
        }

        const url = scans[0].url!;
        console.log(`🔍 Analyzing ${task.type} for URL: ${url}`);

        // Run the appropriate analyzer
        const result = await runners[task.type](url);
        
        // Generate URL hash for cache key
        const urlHash = await generateUrlHash(url);

        // Insert/update analysis cache
        await db
          .insert(schema.analysisCache)
          .values({
            urlHash: `${task.type}_${urlHash}`,
            originalUrl: url,
            auditJson: result,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          })
          .onConflictDoUpdate({
            target: schema.analysisCache.urlHash,
            set: {
              auditJson: result,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });

        // Mark task as complete
        await db
          .update(schema.scanTasks)
          .set({ status: "complete" })
          .where(eq(schema.scanTasks.taskId, task.taskId));

        console.log(`✅ Completed ${task.type} analysis for scan ${task.scanId}`);

        // Check if all tasks for this scan are complete
        const remainingTasks = await db
          .select()
          .from(schema.scanTasks)
          .where(
            and(
              eq(schema.scanTasks.scanId, task.scanId!),
              eq(schema.scanTasks.status, "queued")
            )
          );

        if (remainingTasks.length === 0) {
          // All tasks complete, update scan status
          await db
            .update(schema.scanStatus)
            .set({ 
              status: "complete",
              progress: 100 
            })
            .where(eq(schema.scanStatus.scanId, task.scanId!));

          console.log(`🎉 All tasks completed for scan ${task.scanId}`);
        }

      } catch (err) {
        console.error(`❌ Error processing ${task.type} for scan ${task.scanId}:`, err);
        
        // Mark task as failed
        await db
          .update(schema.scanTasks)
          .set({ 
            status: "failed",
            payload: { error: err instanceof Error ? err.message : String(err) }
          })
          .where(eq(schema.scanTasks.taskId, task.taskId));
      }

    } catch (err) {
      console.error('💥 Worker error:', err);
      // Wait before retrying
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Worker shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Worker shutting down...');
  await pool.end();
  process.exit(0);
});

// Start the worker
work().catch((err) => {
  console.error('💥 Failed to start worker:', err);
  process.exit(1);
});