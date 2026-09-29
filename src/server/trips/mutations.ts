import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { itineraryItem, trip } from "@/lib/db/schema";

type CreateTripInput = {
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
};

type UpdateTripInput = CreateTripInput & {
  tripId: string;
};

export async function createTrip(input: CreateTripInput) {
  const [createdTrip] = await db
    .insert(trip)
    .values({
      userId: input.userId,
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      coverImageUrl: input.coverImageUrl?.trim() || null,
    })
    .returning();

  return createdTrip;
}

export async function updateTrip(input: UpdateTripInput) {
  const existingItems = await db
    .select({ date: itineraryItem.date })
    .from(itineraryItem)
    .where(eq(itineraryItem.tripId, input.tripId));

  const hasItemsOutsideRange = existingItems.some(
    (item) => item.date < input.startDate || item.date > input.endDate,
  );

  if (hasItemsOutsideRange) {
    throw new Error("TRIP_DATE_RANGE_CONFLICT");
  }

  const [updatedTrip] = await db
    .update(trip)
    .set({
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      coverImageUrl: input.coverImageUrl?.trim() || null,
    })
    .where(and(eq(trip.id, input.tripId), eq(trip.userId, input.userId)))
    .returning();

  return updatedTrip ?? null;
}

export async function deleteTrip(tripId: string, userId: string) {
  const [deletedTrip] = await db
    .delete(trip)
    .where(and(eq(trip.id, tripId), eq(trip.userId, userId)))
    .returning({ id: trip.id });

  return deletedTrip ?? null;
}
