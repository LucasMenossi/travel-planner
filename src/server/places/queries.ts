import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { place, trip } from "@/lib/db/schema";

export async function getPlacesByTripId(tripId: string, userId: string) {
  return db
    .select({
      id: place.id,
      externalId: place.externalId,
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category,
      imageUrl: place.imageUrl,
      createdAt: place.createdAt,
    })
    .from(place)
    .innerJoin(trip, eq(place.tripId, trip.id))
    .where(and(eq(place.tripId, tripId), eq(trip.userId, userId)))
    .orderBy(asc(place.createdAt));
}
