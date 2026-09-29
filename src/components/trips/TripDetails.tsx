"use client";

import { useState } from "react";

import { Itinerary, type ItineraryItem } from "@/components/itinerary";
import { PlacesSection } from "@/components/places";
import { TripMap } from "@/components/map";
import type { SavedPlace } from "@/lib/places/types";

type TripDetailsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  initialPlaces: SavedPlace[];
  initialItems: ItineraryItem[];
};

export function TripDetails({
  tripId,
  startDate,
  endDate,
  initialPlaces,
  initialItems,
}: TripDetailsProps) {
  const [savedPlaces, setSavedPlaces] = useState(initialPlaces);

  function handlePlaceSaved(place: SavedPlace) {
    setSavedPlaces((current) => {
      if (current.some((item) => item.id === place.id)) return current;
      return [...current, place];
    });
  }

  function handlePlaceRemoved(placeId: string) {
    setSavedPlaces((current) =>
      current.filter((place) => place.id !== placeId),
    );
  }

  return (
    <div className="space-y-8">
      <Itinerary
        tripId={tripId}
        startDate={startDate}
        endDate={endDate}
        places={savedPlaces}
        initialItems={initialItems}
      />

      <TripMap places={savedPlaces} />

      <PlacesSection
        tripId={tripId}
        savedPlaces={savedPlaces}
        onPlaceSaved={handlePlaceSaved}
        onPlaceRemoved={handlePlaceRemoved}
      />
    </div>
  );
}
