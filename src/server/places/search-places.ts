import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { trip } from "@/lib/db/schema";
import { geocodingProvider } from "@/lib/geocoding";
import { placesProvider } from "@/lib/places";
import type { PlaceResult } from "@/lib/places/types";

type SearchTripPlacesParams = {
  tripId: string;
  userId: string;
  categories: string[];
  radius?: number;
  limit?: number;
  offset?: number;
};

export async function searchTripPlaces({
  tripId,
  userId,
  categories,
  radius,
  limit,
  offset,
}: SearchTripPlacesParams): Promise<PlaceResult[]> {
  const [currentTrip] = await db
    .select({
      destination: trip.destination,
    })
    .from(trip)
    .where(and(eq(trip.id, tripId), eq(trip.userId, userId)));

  if (!currentTrip) {
    throw new Error("Trip not found.");
  }

  const coordinates = await geocodingProvider.geocode(currentTrip.destination);

  if (!coordinates) {
    return [];
  }

  const places = await placesProvider.searchPlaces({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    categories,
    radius,
    limit: limit ?? 10,
    offset,
  });

  return places;
}
