"use client";

import { useState } from "react";

import { getCategoryLabel } from "@/lib/places/category-label";
import { saveTripPlace, searchTripPlaces } from "@/lib/places/client";
import type { PlaceResult, SavedPlace } from "@/lib/places/types";

type PlaceDiscoveryProps = {
  tripId: string;
  savedPlaces: SavedPlace[];
  onPlaceSaved: (place: SavedPlace) => void;
  readOnly?: boolean;
};

const CATEGORIES = [
  {
    value: "catering.restaurant",
    label: "Restaurants",
  },
  {
    value: "catering.cafe",
    label: "Cafés",
  },
  {
    value: "tourism.sights",
    label: "Attractions",
  },
];

export function PlaceDiscovery({
  tripId,
  savedPlaces,
  onPlaceSaved,
  readOnly = false,
}: PlaceDiscoveryProps) {
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null);

  const savedPlaceIds = new Set(savedPlaces.map((place) => place.externalId));

  const availablePlaces = places.filter(
    (place) => !savedPlaceIds.has(place.externalId),
  );

  async function handleSearch() {
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchTripPlaces(tripId, [category]);

      setPlaces(results);
    } catch {
      setError("Unable to find places right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(place: PlaceResult) {
    if (readOnly) {
      return;
    }

    setSavingPlaceId(place.externalId);
    setError(null);

    try {
      const savedPlace = await saveTripPlace(tripId, place);

      onPlaceSaved(savedPlace);
    } catch {
      setError("Unable to save this place.");
    } finally {
      setSavingPlaceId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Discover places</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Find places near your destination to add to your trip.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            aria-pressed={category === item.value}
            className={
              category === item.value
                ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                : "rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            }
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {readOnly && (
        <p className="text-sm text-muted-foreground">
          You are viewing this trip in read-only mode.
        </p>
      )}

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {!isLoading && places.length === 0 && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Search for places near your destination.
        </p>
      )}

      {!isLoading && places.length > 0 && availablePlaces.length === 0 && (
        <p className="text-sm text-muted-foreground">
          All places from this search are already saved.
        </p>
      )}

      {availablePlaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availablePlaces.map((place) => {
            const isSaving = savingPlaceId === place.externalId;

            return (
              <article
                key={place.externalId}
                className="flex h-full flex-col rounded-xl border bg-card p-5"
              >
                <div className="space-y-2">
                  <h3 className="font-semibold">{place.name}</h3>

                  {place.address && (
                    <p className="text-sm text-muted-foreground">
                      {place.address}
                    </p>
                  )}

                  {place.category && (
                    <p className="text-xs text-muted-foreground">
                      {getCategoryLabel(place.category)}
                    </p>
                  )}
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(place)}
                    className="mt-auto rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
