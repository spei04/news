import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { subscriptions } from "./schema";

export type SubscriptionRow = {
  email: string;
  enabled: boolean;
  categorySlugs: string[];
  timezone: string;
  sendHour: number;
};

export async function getSubscriptionByEmail(email: string): Promise<SubscriptionRow | null> {
  const db = getDb();
  if (!db) return null;

  const rows = await db.select().from(subscriptions).where(eq(subscriptions.email, email)).limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    email: row.email,
    enabled: row.enabled,
    categorySlugs: Array.isArray(row.categorySlugs) ? (row.categorySlugs as string[]) : [],
    timezone: row.timezone,
    sendHour: row.sendHour
  };
}

export async function upsertSubscriptionByEmail(input: SubscriptionRow & { userId?: number | null }) {
  const db = getDb();
  if (!db) return false;

  const now = new Date();
  await db
    .insert(subscriptions)
    .values({
      userId: input.userId ?? null,
      email: input.email,
      enabled: input.enabled,
      categorySlugs: input.categorySlugs,
      timezone: input.timezone,
      sendHour: input.sendHour,
      createdAt: now
    })
    .onConflictDoUpdate({
      target: subscriptions.email,
      set: {
        enabled: input.enabled,
        categorySlugs: input.categorySlugs,
        timezone: input.timezone,
        sendHour: input.sendHour
      }
    });

  return true;
}

export async function listActiveSubscriptions(): Promise<SubscriptionRow[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db.select().from(subscriptions).where(eq(subscriptions.enabled, true));
  return rows.map((row) => ({
    email: row.email,
    enabled: row.enabled,
    categorySlugs: Array.isArray(row.categorySlugs) ? (row.categorySlugs as string[]) : [],
    timezone: row.timezone,
    sendHour: row.sendHour
  }));
}
