import { eq } from "drizzle-orm";
import * as schema from "../shared/schema.ts";
import { scanTasks } from "../shared/schema.ts";
import { analyzeTech } from "./analysers/tech";
import { analyzeColors } from "./analysers/colors";
import { analyzeSEO } from "./analysers/seo";
import { analyzePerformance } from "./analysers/perf";

const DATABASE_URL = 'postgresql://postgres.kdkuhrbaftksknfgjcch:lkFvjLVOXgPXWJ2S@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
const SUPABASE_URL = 'https://kdkuhrbaftksknfgjcch.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtka3VocmJhZnRrc2tuZmdqY2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY1NTk3MiwiZXhwIjoyMDcwMjMxOTcyfQ.GxgZBq4v6SNusEoW9We2Z2yMJcUt7g-YtwCy8IalErA';

const dbUrl = DATABASE_URL;
console.log('DB_URL', DATABASE_URL);
console.log('🔗 Using DATABASE_URL =', dbUrl);

// Task runners mapping
const runners: Record<string, (url: string, scanId: string) => Promise<any>> = {
  tech: analyzeTech,
  colors: analyzeColors,
  seo: analyzeSEO,
  perf: analyzePerformance,
};

async function initializeWorker() {
  console.log('🔗 Initializing worker database connection...');

  const SUPABASE_URL_CONST = SUPABASE_URL;
  const SUPABASE_SERVICE_KEY_CONST = SUPABASE_SERVICE_KEY;
  console.log('VITE_SUPABASE_URL:', SUPABASE_URL_CONST ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY_CONST ? 'SET' : 'MISSING');

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
      const pollQuery = db
        .select()
        .from(scanTasks)
        .where(eq(scanTasks.status, "queued"))
        .orderBy(scanTasks.taskId)
        .limit(1);
      const { sql: pollSql, params: pollParams } = pollQuery.toSQL();
      console.log('📝 poll sql', pollSql, pollParams);
      const tasks = await pollQuery;
      console.log('📋 poll rows', tasks);
      console.log(`📊 poll found ${tasks.length} tasks`);
      

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
      try {
        await db
          .update(scanTasks)
          .set({ status: "running" })
          .where(eq(scanTasks.taskId, task.taskId));
        console.log(`🏃 Task ${task.taskId} set to running`);
      } catch (err) {
        console.error(`❌ Failed to set task ${task.taskId} to running:`, err);
        throw err;
      }

      // Ensure scan status shows running
      try {
        await db
          .update(schema.scanStatus)
          .set({ status: 'running', updatedAt: new Date() })
          .where(eq(schema.scanStatus.scanId, task.scanId!));
      } catch (err) {
        console.error(`❌ Failed to update scan status to running for ${task.scanId}:`, err);
      }

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

        // Run the appropriate analyzer which handles its own persistence
        await runners[task.type](url, task.scanId!);

        // Mark task as complete
        try {
          await db
            .update(scanTasks)
            .set({ status: "complete" })
            .where(eq(scanTasks.taskId, task.taskId));
          console.log(`✅ Completed ${task.type} analysis for scan ${task.scanId}`);
        } catch (err) {
          console.error(`❌ Failed to mark task ${task.taskId} complete:`, err);
          throw err;
        }

        // Update scan progress and status
        const tasksForScan = await db
          .select()
          .from(scanTasks)
          .where(eq(scanTasks.scanId, task.scanId!));

        const totalCount = tasksForScan.length;
        const completedCount = tasksForScan.filter(t => t.status === 'complete').length;
        const progress = Math.round((completedCount / totalCount) * 100);
        const newStatus = completedCount === totalCount ? 'complete' : 'running';

        try {
          await db
            .update(schema.scanStatus)
            .set({ status: newStatus, progress })
            .where(eq(schema.scanStatus.scanId, task.scanId!));
          if (newStatus === 'complete') {
            console.log(`🎉 All tasks completed for scan ${task.scanId}`);
          }
        } catch (err) {
          console.error(`❌ Failed to update scan status for ${task.scanId}:`, err);
        }

      } catch (err) {
        console.error(`❌ Error processing ${task.type} for scan ${task.scanId}:`, err);

        // Mark task as failed
        try {
          await db
            .update(scanTasks)
            .set({
              status: "failed",
              payload: { error: err instanceof Error ? err.message : String(err) }
            })
            .where(eq(scanTasks.taskId, task.taskId));
        } catch (e2) {
          console.error(`❌ Failed to mark task ${task.taskId} failed:`, e2);
        }
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