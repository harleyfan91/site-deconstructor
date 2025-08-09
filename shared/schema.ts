import { pgTable, text, serial, uuid, timestamp, jsonb, boolean, smallint, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// scans
export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"), // FK -> auth.users (nullable for anon)
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastRunAt: timestamp("last_run_at"),
  active: boolean("active").default(true),
});

// scan_status
export const scanStatus = pgTable("scan_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  status: text("status")
    .$type<"queued" | "running" | "complete" | "failed">()
    .notNull(),
  progress: smallint("progress").default(0),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// analysis_cache
export const analysisCache = pgTable("analysis_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id").notNull(),
  type: text("type").notNull(),
  urlHash: text("url_hash").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  auditJson: jsonb("audit_json").notNull(),
});

// scan_tasks
export const scanTasks = pgTable("scan_tasks", {
  taskId: uuid("task_id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  type: text("type")
    .$type<"tech" | "colors" | "seo" | "perf">()
    .notNull(),
  status: text("status")
    .$type<"queued" | "running" | "complete" | "failed">()
    .notNull()
    .default("queued"),
  payload: jsonb("payload"),

  createdAt: timestamp("created_at", { mode: "date" })

    .notNull()
    .defaultNow(),
});

// scan_results
export const scanResults = pgTable("scan_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  durationMs: integer("duration_ms").notNull(),
  status: text("status").$type<'ok' | 'error'>().notNull(),
  error: text("error"),
  results: jsonb("results").notNull(),
}, (table) => ({
  urlIdx: index("scan_results_url_idx").on(table.url),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScansSchema = createInsertSchema(scans).pick({
  userId: true,
  url: true,
  active: true,
});

export const insertScanStatusSchema = createInsertSchema(scanStatus).pick({
  scanId: true,
  status: true,
  progress: true,
  error: true,
});

export const insertAnalysisCacheSchema = createInsertSchema(analysisCache).pick({
  scanId: true,
  type: true,
  urlHash: true,
  originalUrl: true,
  auditJson: true,
  expiresAt: true,
});

export const insertScanTasksSchema = createInsertSchema(scanTasks).pick({
  scanId: true,
  type: true,
  status: true,
  payload: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScans = z.infer<typeof insertScansSchema>;
export type Scans = typeof scans.$inferSelect;
export type InsertScanStatus = z.infer<typeof insertScanStatusSchema>;
export type ScanStatus = typeof scanStatus.$inferSelect;
export type InsertAnalysisCache = z.infer<typeof insertAnalysisCacheSchema>;
export type AnalysisCache = typeof analysisCache.$inferSelect;
export type InsertScanTasks = z.infer<typeof insertScanTasksSchema>;
export type ScanTasks = typeof scanTasks.$inferSelect;
export type ScanResults = typeof scanResults.$inferSelect;
export type InsertScanResults = typeof scanResults.$inferInsert;
