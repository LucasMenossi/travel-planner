import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { trip } from "@/lib/db/schema";

export async function getTripsByUserId(userId: string) {
  return db
    .select()
    .from(trip)
    .where(eq(trip.userId, userId))
    .orderBy(desc(trip.createdAt));
}

export async function getTripById(tripId: string, userId: string) {
  const [result] = await db
    .select()
    .from(trip)
    .where(and(eq(trip.id, tripId), eq(trip.userId, userId)))
    .limit(1);

  return result ?? null;
}
