import { pgTable, serial, text, timestamp, jsonb, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t) => ({
    slugIdx: uniqueIndex("categories_slug_unique").on(t.slug)
  })
);

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(), // stable code id (e.g. "techcrunch")
  name: text("name").notNull(),
  feedUrl: text("feed_url").notNull(),
  categorySlugs: jsonb("category_slugs").notNull(), // string[]
  weight: integer("weight").notNull().default(1),
  enabled: boolean("enabled").notNull().default(true)
});

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    sourceName: text("source_name").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    categorySlug: text("category_slug").notNull(),
    score: integer("score").notNull().default(0),
    summary: jsonb("summary").notNull(),
    whyItMatters: text("why_it_matters").notNull()
  },
  (t) => ({
    urlIdx: uniqueIndex("items_url_unique").on(t.url)
  })
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id"),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull()
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_unique").on(t.email),
    clerkIdx: uniqueIndex("users_clerk_unique").on(t.clerkUserId)
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    email: text("email").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    categorySlugs: jsonb("category_slugs").notNull(), // string[]
    timezone: text("timezone").notNull().default("America/New_York"),
    sendHour: integer("send_hour").notNull().default(7),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull()
  },
  (t) => ({
    emailIdx: uniqueIndex("subscriptions_email_unique").on(t.email)
  })
);

export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  categorySlug: text("category_slug").notNull().default("all"),
  date: text("date").notNull(), // YYYY-MM-DD
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
  items: jsonb("items").notNull(), // Digest["items"]
  stats: jsonb("stats").notNull() // Digest["stats"]
});
