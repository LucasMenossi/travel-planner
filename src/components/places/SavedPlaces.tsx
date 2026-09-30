"use client";

import { useState } from "react";

import { removeTripPlace } from "@/lib/places/client";
import type { SavedPlace } from "@/lib/places/types";

type SavedPlacesProps = {
  tripId: string;
  places: SavedPlace[];
  onPlaceRemoved: (placeId: string) => void;
};

export function SavedPlaces({
  tripId,
  places,
  onPlaceRemoved,
}: SavedPlacesProps) {
  const [removingPlaceId, setRemovingPlaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(placeId: string) {
    setRemovingPlaceId(placeId);
    setError(null);

    try {
      await removeTripPlace(tripId, placeId);
      onPlaceRemoved(placeId);
    } catch {
      setError("Unable to remove this place.");
    } finally {
      setRemovingPlaceId(null);
    }
  }

  return (
    <section
      aria-labelledby="saved-places-heading"
      className="rounded-2xl border bg-card p-6"
    >
      <h2 id="saved-places-heading" className="font-semibold">
        Saved places
      </h2>

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {places.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Places you save for this trip will appear here.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.map((place) => {
            const isRemoving = removingPlaceId === place.id;

            return (
              <li
                key={place.id}
                className="flex min-w-0 items-start justify-between gap-3 rounded-xl border bg-background p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{place.name}</p>

                  {place.address && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {place.address}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => handleRemove(place.id)}
                  className="shrink-0 text-sm font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
