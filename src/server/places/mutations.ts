import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { place, trip } from "@/lib/db/schema";
import { assertCanMutate } from "@/lib/user-access";

export type SavePlaceInput = {
  userId: string;
  tripId: string;
  externalId: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  imageUrl?: string | null;
};

export async function savePlace(input: SavePlaceInput) {
  await assertCanMutate(input.userId);

  const [currentTrip] = await db
    .select({ id: trip.id })
    .from(trip)
    .where(and(eq(trip.id, input.tripId), eq(trip.userId, input.userId)));

  if (!currentTrip) {
    throw new Error("Trip not found.");
  }

  const [savedPlace] = await db
    .insert(place)
    .values({
      tripId: input.tripId,
      externalId: input.externalId,
      name: input.name,
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      category: input.category ?? null,
      imageUrl: input.imageUrl ?? null,
    })
    .onConflictDoNothing({
      target: [place.tripId, place.externalId],
    })
    .returning();

  if (savedPlace) {
    return savedPlace;
  }

  const [existingPlace] = await db
    .select()
    .from(place)
    .where(
      and(
        eq(place.tripId, input.tripId),
        eq(place.externalId, input.externalId),
      ),
    )
    .limit(1);

  return existingPlace ?? null;
}

export async function deletePlace({
  tripId,
  placeId,
  userId,
}: {
  tripId: string;
  placeId: string;
  userId: string;
}) {
  await assertCanMutate(userId);

  const [currentTrip] = await db
    .select({ id: trip.id })
    .from(trip)
    .where(and(eq(trip.id, tripId), eq(trip.userId, userId)));

  if (!currentTrip) {
    throw new Error("Trip not found.");
  }

  const [deletedPlace] = await db
    .delete(place)
    .where(and(eq(place.id, placeId), eq(place.tripId, tripId)))
    .returning();

  return deletedPlace ?? null;
}
