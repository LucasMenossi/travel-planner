"use client";

import { useState } from "react";

import { type SavedPlace } from "@/lib/places/client";

import { PlaceDiscovery } from "./PlaceDiscovery";
import { SavedPlaces } from "./SavedPlaces";

type PlacesSectionProps = {
  tripId: string;
  initialPlaces: SavedPlace[];
};

export function PlacesSection({ tripId, initialPlaces }: PlacesSectionProps) {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(initialPlaces);

  function handlePlaceSaved(place: SavedPlace) {
    setSavedPlaces((current) => [...current, place]);
  }

  function handlePlaceRemoved(placeId: string) {
    setSavedPlaces((current) =>
      current.filter((place) => place.id !== placeId),
    );
  }

  return (
    <div className="space-y-6">
      <SavedPlaces
        tripId={tripId}
        places={savedPlaces}
        onPlaceRemoved={handlePlaceRemoved}
      />

      <PlaceDiscovery
        tripId={tripId}
        savedPlaces={savedPlaces}
        onPlaceSaved={handlePlaceSaved}
      />
    </div>
  );
}
