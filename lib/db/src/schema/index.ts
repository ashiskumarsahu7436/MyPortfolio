import { pgTable, serial, text, boolean, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Profile ────────────────────────────────────────────────────────────────
export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  bio: text("bio").notNull().default(""),
  email: text("email").notNull().default(""),
  github_url: text("github_url").notNull().default(""),
  linkedin_url: text("linkedin_url").notNull().default(""),
  photo_url: text("photo_url").notNull().default(""),
  focus: text("focus").notNull().default(""),
  philosophy: text("philosophy").notNull().default(""),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, updated_at: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;

// ─── Projects ────────────────────────────────────────────────────────────────
export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  live_url: text("live_url").notNull().default(""),
  github_url: text("github_url").notNull().default(""),
  thumbnail: text("thumbnail").notNull().default(""),
  sort_order: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  status: text("status").notNull().default("In Progress"),
  label: text("label").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;

// ─── Certifications ──────────────────────────────────────────────────────────
export const certificationsTable = pgTable("certifications", {
  id:             serial("id").primaryKey(),
  title:          text("title").notNull().default(""),
  issuer:         text("issuer").notNull().default(""),
  issue_date:     date("issue_date"),
  expiry_date:    date("expiry_date"),
  credential_url: text("credential_url").notNull().default(""),
  badge_url:      text("badge_url").notNull().default(""),
  sort_order:     integer("sort_order").notNull().default(0),
  published:      boolean("published").notNull().default(true),
  created_at:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCertificationSchema = createInsertSchema(certificationsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Certification = typeof certificationsTable.$inferSelect;

// ─── Resume ──────────────────────────────────────────────────────────────────
export const resumeTable = pgTable("resume", {
  id: serial("id").primaryKey(),
  file_url: text("file_url").notNull().default(""),
  last_updated: date("last_updated"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumeTable).omit({ id: true, updated_at: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumeTable.$inferSelect;
