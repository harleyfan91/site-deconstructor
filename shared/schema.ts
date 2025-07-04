import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analysisCache = pgTable("analysis_cache", {
  id: serial("id").primaryKey(),
  urlHash: text("url_hash").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  analysisData: json("analysis_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisCacheSchema = createInsertSchema(analysisCache).pick({
  urlHash: true,
  originalUrl: true,
  analysisData: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysisCache = z.infer<typeof insertAnalysisCacheSchema>;
export type AnalysisCache = typeof analysisCache.$inferSelect;
