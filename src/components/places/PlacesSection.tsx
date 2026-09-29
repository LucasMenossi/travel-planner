"use client";

import type { SavedPlace } from "@/lib/places/types";

import { PlaceDiscovery } from "./PlaceDiscovery";
import { SavedPlaces } from "./SavedPlaces";

type PlacesSectionProps = {
  tripId: string;
  savedPlaces: SavedPlace[];
  onPlaceSaved: (place: SavedPlace) => void;
  onPlaceRemoved: (placeId: string) => void;
};

export function PlacesSection({
  tripId,
  savedPlaces,
  onPlaceSaved,
  onPlaceRemoved,
}: PlacesSectionProps) {
  return (
    <div className="space-y-8">
      <SavedPlaces
        tripId={tripId}
        places={savedPlaces}
        onPlaceRemoved={onPlaceRemoved}
      />

      <PlaceDiscovery
        tripId={tripId}
        savedPlaces={savedPlaces}
        onPlaceSaved={onPlaceSaved}
      />
    </div>
  );
}
