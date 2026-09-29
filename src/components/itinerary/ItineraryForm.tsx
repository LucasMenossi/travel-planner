"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SavedPlace } from "@/lib/places/types";
import { createItineraryItemSchema } from "@/lib/validation/itinerary";

import type { ItineraryItem } from "./types";

type ItineraryFormProps = {
  tripId: string;
  places: SavedPlace[];
  item?: ItineraryItem;
  existingItems: ItineraryItem[];
  date: string;
  onSaved: (item: ItineraryItem) => void;
  onCancel: () => void;
};

export function ItineraryForm({
  tripId,
  places,
  item,
  existingItems,
  date,
  onSaved,
  onCancel,
}: ItineraryFormProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [startTime, setStartTime] = useState(item?.startTime ?? "");
  const [endTime, setEndTime] = useState(item?.endTime ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [placeId, setPlaceId] = useState(item?.placeId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsed = createItineraryItemSchema.safeParse({
      date,
      title,
      startTime: startTime || null,
      endTime: endTime || null,
      notes: notes || null,
      placeId: placeId || null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      setIsSubmitting(false);
      return;
    }

    if (parsed.data.startTime && parsed.data.endTime) {
      const overlappingItem = existingItems.find((existingItem) => {
        if (existingItem.id === item?.id || existingItem.date !== parsed.data.date) {
          return false;
        }

        if (!existingItem.startTime || !existingItem.endTime) {
          return false;
        }

        return (
          existingItem.startTime < parsed.data.endTime! &&
          existingItem.endTime > parsed.data.startTime!
        );
      });

      if (overlappingItem) {
        setError(`This time overlaps with “${overlappingItem.title}”.`);
        setIsSubmitting(false);
        return;
      }
    }

    const response = await fetch(
      item
        ? `/api/trips/${tripId}/itinerary/${item.id}`
        : `/api/trips/${tripId}/itinerary`,
      {
        method: item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setError(body?.message ?? "Unable to save this activity.");
      setIsSubmitting(false);
      return;
    }

    const savedItem = body.data as ItineraryItem;
    const savedPlace = places.find((place) => place.id === savedItem.placeId);
    onSaved({
      ...savedItem,
      placeName: savedPlace?.name ?? item?.placeName ?? null,
    });
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-background p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="itinerary-title">Activity</Label>
          <Input
            id="itinerary-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Visit Meiji Shrine"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itinerary-place">Saved place</Label>
          <select
            id="itinerary-place"
            value={placeId}
            onChange={(event) => setPlaceId(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">None</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itinerary-start">Start time</Label>
          <Input
            id="itinerary-start"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itinerary-end">End time</Label>
          <Input
            id="itinerary-end"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="itinerary-notes">Notes</Label>
          <textarea
            id="itinerary-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Anything to remember?"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : item ? "Save changes" : "Add activity"}
        </Button>
      </div>
    </form>
  );
}
