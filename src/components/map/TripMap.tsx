"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import maplibregl, { type Map, type Marker, type Popup } from "maplibre-gl";

import type { SavedPlace } from "@/lib/places/types";

type TripMapProps = {
  places: SavedPlace[];
};

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505];
const DEFAULT_ZOOM = 3;

export function TripMap({ places }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const placesWithCoordinates = useMemo(
    () =>
      places.filter(
        (
          place,
        ): place is SavedPlace & { latitude: number; longitude: number } =>
          place.latitude !== null && place.longitude !== null,
      ),
    [places],
  );

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  useEffect(() => {
    if (!containerRef.current || !apiKey || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const handleLoad = () => setMapReady(true);
    map.once("load", handleLoad);
    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupRef.current?.remove();
    popupRef.current = null;

    if (placesWithCoordinates.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    placesWithCoordinates.forEach((place) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.setAttribute("aria-label", `View ${place.name}`);
      markerElement.className =
        "group flex size-9 items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

      const markerVisual = document.createElement("span");
      markerVisual.className =
        "flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110";

      const icon = document.createElement("span");
      icon.className = "relative block size-3 rounded-full bg-current";
      markerVisual.appendChild(icon);
      markerElement.appendChild(markerVisual);

      const popupContent = document.createElement("div");
      popupContent.className = "space-y-1";

      const title = document.createElement("p");
      title.className = "font-semibold";
      title.textContent = place.name;
      popupContent.appendChild(title);

      if (place.address) {
        const address = document.createElement("p");
        address.className = "text-sm text-gray-600";
        address.textContent = place.address;
        popupContent.appendChild(address);
      }

      const popup = new maplibregl.Popup({ offset: 20 }).setDOMContent(
        popupContent,
      );

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([place.longitude, place.latitude]);
    });

    if (placesWithCoordinates.length === 1) {
      const place = placesWithCoordinates[0];
      map.easeTo({
        center: [place.longitude, place.latitude],
        zoom: 14,
        duration: 500,
      });
      return;
    }

    map.fitBounds(bounds, {
      padding: 64,
      maxZoom: 14,
      duration: 500,
    });
  }, [mapReady, placesWithCoordinates]);

  const mapMessage =
    places.length === 0
      ? "Save places to see them on your trip map."
      : "Your saved places do not have coordinates yet, so they cannot be displayed on the map.";

  const showMapMessage =
    places.length === 0 || placesWithCoordinates.length === 0;

  return (
    <section aria-labelledby="trip-map-heading" className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-6 py-4">
        <h2 id="trip-map-heading" className="font-semibold">Trip map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore your saved places and select a marker for more information.
        </p>
      </div>

      <div className="relative">
        <div ref={containerRef} aria-label="Map showing saved trip places" role="application" className="h-[360px] w-full sm:h-[440px]" />

        {showMapMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
            <div className="max-w-sm rounded-2xl border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{mapMessage}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
