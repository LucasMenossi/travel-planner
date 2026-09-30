"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Itinerary, type ItineraryItem } from "@/components/itinerary";
import { PlacesSection } from "@/components/places";

const TripMap = dynamic(
  () => import("@/components/map").then((module) => module.TripMap),
  {
    ssr: false,
    loading: () => (
      <section
        aria-labelledby="trip-map-heading"
        className="overflow-hidden rounded-2xl border bg-card"
      >
        <div className="border-b px-6 py-4">
          <h2 id="trip-map-heading" className="font-semibold">Trip map</h2>
          <p className="mt-1 text-sm text-muted-foreground">Loading map…</p>
        </div>
        <div className="h-[360px] w-full animate-pulse bg-muted sm:h-[440px]" />
      </section>
    ),
  },
);
import type { SavedPlace } from "@/lib/places/types";

type TripDetailsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  initialPlaces: SavedPlace[];
  initialItems: ItineraryItem[];
  readOnly?: boolean;
};

export function TripDetails({
  tripId,
  startDate,
  endDate,
  initialPlaces,
  initialItems,
  readOnly = false,
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
        readOnly={readOnly}
      />

      <TripMap places={savedPlaces} />

      <PlacesSection
        tripId={tripId}
        savedPlaces={savedPlaces}
        onPlaceSaved={handlePlaceSaved}
        onPlaceRemoved={handlePlaceRemoved}
        readOnly={readOnly}
      />
    </div>
  );
}
