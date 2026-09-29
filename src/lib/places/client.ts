import type { PlaceResult, SavedPlace } from "./types";

export type { PlaceResult, SavedPlace } from "./types";

type SearchPlacesResponse = {
  data: PlaceResult[];
};

type SavePlaceResponse = {
  data: SavedPlace;
};

export async function searchTripPlaces(
  tripId: string,
  categories: string[],
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    categories: categories.join(","),
  });

  const response = await fetch(
    `/api/trips/${tripId}/places?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search places.");
  }

  const result = (await response.json()) as SearchPlacesResponse;
  return result.data;
}

export async function saveTripPlace(
  tripId: string,
  place: PlaceResult,
): Promise<SavedPlace> {
  const response = await fetch(`/api/trips/${tripId}/places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(place),
  });

  if (!response.ok) {
    throw new Error("Failed to save place.");
  }

  const result = (await response.json()) as SavePlaceResponse;
  return result.data;
}

export async function removeTripPlace(
  tripId: string,
  placeId: string,
): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/places/${placeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove place.");
  }
}
