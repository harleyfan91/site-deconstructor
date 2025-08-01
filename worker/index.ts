import { eq, and } from "drizzle-orm";
import * as schema from "../shared/schema.ts";
import { scanTasks } from "../shared/schema.ts";
import { analyzeTech } from "./analysers/tech";
import { analyzeColors } from "./analysers/colors";
import { analyzeSEO } from "./analysers/seo";
import { analyzePerformance } from "./analysers/perf";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

// Log the Supabase host for visibility at startup
try {
  const dbHost = new URL(process.env.DATABASE_URL).host;
  console.log('🔗 Using database host:', dbHost);
} catch {
  console.log('🔗 Using database host: unknown');
}

// Task runners mapping
const runners: Record<string, (url: string) => Promise<any>> = {
  tech: analyzeTech,
  colors: analyzeColors,
  seo: analyzeSEO,
  perf: analyzePerformance,
};

async function generateUrlHash(url: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(url).digest('hex');
}

async function initializeWorker() {
  console.log('🔗 Initializing worker database connection...');

  // Load environment variables from process.env
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables');
    console.log('VITE_SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
    throw new Error('Missing required environment variables');
  }

  try {
    // Import database connection with correct extension
    const { db } = await import('../server/db.ts');
    
    console.log('✅ Database connection established');

    // Test the connection
    const testQuery = await db.select().from(schema.scans).limit(1);
    console.log('✅ Database test query successful');

    return db;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

async function work() {
  console.log('🚀 Worker started - initializing...');

  const db = await initializeWorker();
  console.log('🔄 Starting task polling loop...');

  let consecutiveEmptyPolls = 0;
  const MAX_EMPTY_POLLS = 12; // Max 1 minute of empty polls before longer wait

  while (true) {
    try {
      console.log('🔍 Polling for queued tasks...');

      // First, check for and reset old failed tasks (only reset tasks that are older than 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const oldFailedTasks = await db
        .select()
        .from(scanTasks)
        .where(eq(scanTasks.status, "failed"))
        .limit(5); // Limit to prevent too many resets

      // Only reset failed tasks that are actually old, not immediately
      let resetCount = 0;
      if (oldFailedTasks.length > 0) {
        for (const task of oldFailedTasks) {
          // Check if task was created more than 10 minutes ago
          if (task.createdAt && task.createdAt < tenMinutesAgo) {
            await db
              .update(scanTasks)
              .set({ 
                status: "queued",
                payload: null 
              })
              .where(eq(scanTasks.taskId, task.taskId));
            resetCount++;
          }
        }
        
        if (resetCount > 0) {
          console.log(`🔄 Reset ${resetCount} old failed tasks to queued status`);
        }
      }

      // Get next queued task
      const tasks = await db
        .select()
        .from(scanTasks)
        .where(eq(scanTasks.status, "queued"))
        .orderBy(scanTasks.taskId)
        .limit(1);

      console.log(`📊 Found ${tasks.length} queued tasks`);
      
      // Debug: Check total tasks in database
      const allTasks = await db.select().from(scanTasks).limit(5);
      console.log(`🔍 Total tasks in database: ${allTasks.length}`);
      if (allTasks.length > 0) {
        console.log(`📋 Sample tasks:`, allTasks.map(t => ({
          id: t.taskId,
          type: t.type,
          status: t.status,
          scanId: t.scanId
        })));
      }
      
      // Debug: Check scans in database
      const allScans = await db.select().from(schema.scans).limit(3);
      console.log(`📊 Total scans in database: ${allScans.length}`);
      if (allScans.length > 0) {
        console.log(`🔗 Recent scans:`, allScans.map(s => ({
          id: s.id,
          url: s.url,
          createdAt: s.createdAt
        })));
      }

      if (!tasks.length) {
        consecutiveEmptyPolls++;
        
        // Check if we have any tasks at all
        const totalTasks = await db.select().from(scanTasks).limit(1);
        
        if (totalTasks.length === 0) {
          console.log(`😴 No tasks in database, waiting... (empty polls: ${consecutiveEmptyPolls})`);
        } else {
          console.log(`😴 No queued tasks found (all completed/failed), waiting... (empty polls: ${consecutiveEmptyPolls})`);
        }
        
        // Progressive backoff: longer waits if consistently empty
        const waitTime = consecutiveEmptyPolls > MAX_EMPTY_POLLS ? 30000 : 5000; // 30s vs 5s
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      // Reset empty poll counter when we find work
      consecutiveEmptyPolls = 0;

      const task = tasks[0];
      console.log(`📋 Processing task: ${task.type} for scan ${task.scanId}`);

      // Mark task as running
      await db
        .update(scanTasks)
        .set({ status: "running" })
        .where(eq(scanTasks.taskId, task.taskId));

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

        // Generate URL hash
        const urlHash = await generateUrlHash(url);
        const cacheKey = `${task.type}_${urlHash}`;

        // Store result in analysis_cache
        await db
          .insert(schema.analysisCache)
          .values({
            urlHash: cacheKey,
            auditJson: result,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          })
          .onConflictDoUpdate({
            target: schema.analysisCache.urlHash,
            set: {
              auditJson: result,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          });

        console.log(`💾 Stored ${task.type} result in cache with key: ${cacheKey}`);

        // Mark task as complete
        await db
          .update(scanTasks)
          .set({ status: "complete" })
          .where(eq(scanTasks.taskId, task.taskId));

        console.log(`✅ Completed ${task.type} analysis for scan ${task.scanId}`);

        // Check if all tasks for this scan are complete
        const remainingTasks = await db
          .select()
          .from(scanTasks)
          .where(
            and(
              eq(scanTasks.scanId, task.scanId!),
              eq(scanTasks.status, "queued")
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
          .update(scanTasks)
          .set({
            status: "failed",
            payload: { error: err instanceof Error ? err.message : String(err) }
          })
          .where(eq(scanTasks.taskId, task.taskId));
      }

    } catch (err) {
      console.error('💥 Worker error:', err);
      // Wait before retrying
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Worker shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Worker interrupted...');
  process.exit(0);
});

// Start worker with error handling
work().catch((error) => {
  console.error('💥 Worker crashed:', error);
  process.exit(1);
});