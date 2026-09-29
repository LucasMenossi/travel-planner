import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { itineraryItem, place, trip } from "@/lib/db/schema";

export async function getItineraryItemsByTripId(
  tripId: string,
  userId: string,
) {
  return db
    .select({
      id: itineraryItem.id,
      tripId: itineraryItem.tripId,
      placeId: itineraryItem.placeId,
      date: itineraryItem.date,
      title: itineraryItem.title,
      startTime: itineraryItem.startTime,
      endTime: itineraryItem.endTime,
      notes: itineraryItem.notes,
      position: itineraryItem.position,
      createdAt: itineraryItem.createdAt,
      updatedAt: itineraryItem.updatedAt,
      placeName: place.name,
    })
    .from(itineraryItem)
    .innerJoin(trip, eq(itineraryItem.tripId, trip.id))
    .leftJoin(place, eq(itineraryItem.placeId, place.id))
    .where(and(eq(itineraryItem.tripId, tripId), eq(trip.userId, userId)))
    .orderBy(asc(itineraryItem.date), asc(itineraryItem.position));
}
