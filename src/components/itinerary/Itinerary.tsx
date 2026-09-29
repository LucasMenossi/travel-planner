"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { SavedPlace } from "@/lib/places/types";

import { ItineraryForm } from "./ItineraryForm";
import type { ItineraryItem } from "./types";
import { formatDate, formatShortDate, getTripDates } from "./utils";

export type { ItineraryItem } from "./types";

type ItineraryProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  places: SavedPlace[];
  initialItems: ItineraryItem[];
};

export function Itinerary({
  tripId,
  startDate,
  endDate,
  places,
  initialItems,
}: ItineraryProps) {
  const dates = useMemo(
    () => getTripDates(startDate, endDate),
    [startDate, endDate],
  );
  const [items, setItems] = useState(initialItems);
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ItineraryItem[]>();
    dates.forEach((date) => groups.set(date, []));
    items.forEach((item) => groups.get(item.date)?.push(item));
    return groups;
  }, [dates, items]);

  const selectedDayItems = useMemo(
    () => groupedItems.get(selectedDate) ?? [],
    [groupedItems, selectedDate],
  );

  function openCreate(date: string) {
    setSelectedDate(date);
    setEditingId(null);
    setIsFormOpen(true);
    setError(null);
  }

  function openEdit(item: ItineraryItem) {
    setSelectedDate(item.date);
    setEditingId(item.id);
    setIsFormOpen(true);
    setError(null);
  }

  function handleSaved(item: ItineraryItem) {
    setItems((current) => {
      const exists = current.some((currentItem) => currentItem.id === item.id);
      const next = exists
        ? current.map((currentItem) =>
            currentItem.id === item.id ? item : currentItem,
          )
        : [...current, item];
      return next.sort(
        (a, b) => a.date.localeCompare(b.date) || a.position - b.position,
      );
    });
    setIsFormOpen(false);
    setEditingId(null);
  }

  async function removeItem(itemId: string) {
    setError(null);
    const response = await fetch(`/api/trips/${tripId}/itinerary/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Unable to remove this itinerary item.");
      return;
    }

    setItems((current) => {
      const removed = current.find((item) => item.id === itemId);
      return current
        .filter((item) => item.id !== itemId)
        .map((item) =>
          removed &&
          item.date === removed.date &&
          item.position > removed.position
            ? { ...item, position: item.position - 1 }
            : item,
        );
    });
  }

  async function moveItem(item: ItineraryItem, direction: "up" | "down") {
    setError(null);
    const response = await fetch(`/api/trips/${tripId}/itinerary/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

    if (!response.ok) {
      setError("Unable to reorder this itinerary item.");
      return;
    }

    const { data } = await response.json();

    if (!data) return;

    setItems((current) => {
      const neighbor = current.find(
        (currentItem) =>
          currentItem.id !== data.id &&
          currentItem.date === data.date &&
          currentItem.position === data.position,
      );

      return current
        .map((currentItem) => {
          if (currentItem.id === data.id) {
            return data;
          }

          if (neighbor && currentItem.id === neighbor.id) {
            return { ...currentItem, position: item.position };
          }

          return currentItem;
        })
        .sort(
          (a: ItineraryItem, b: ItineraryItem) =>
            a.date.localeCompare(b.date) || a.position - b.position,
        );
    });
  }

  return (
    <section className="space-y-5 rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">Itinerary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan activities and places for each day of your trip.
          </p>
        </div>

        {!isFormOpen && (
          <Button type="button" onClick={() => openCreate(selectedDate)}>
            Add activity
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="relative -mx-1 px-1">
        <div
          className="flex gap-2 overflow-x-auto pb-2 pr-1"
          aria-label="Trip days"
        >
          {dates.map((date) => {
            const isSelected = selectedDate === date;
            const itemCount = groupedItems.get(date)?.length ?? 0;
            const formatted = formatShortDate(date);
            const [weekday, month, day] = formatted.replace(",", "").split(" ");
            const monthDay = `${month} ${day}`;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                disabled={isFormOpen}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "min-w-[104px] rounded-xl border border-primary bg-primary px-3 py-2.5 text-left text-primary-foreground shadow-sm disabled:cursor-not-allowed"
                    : "min-w-[104px] rounded-xl border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                <span className="block text-xs font-medium uppercase tracking-wide opacity-75">
                  {monthDay}
                </span>
                <span className="mt-0.5 block text-sm font-semibold">
                  {weekday}
                </span>
                <span className="mt-0.5 block text-xs opacity-75">
                  {itemCount} {itemCount === 1 ? "activity" : "activities"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="font-semibold">{formatDate(selectedDate)}</h3>
          <p className="text-xs text-muted-foreground">{selectedDate}</p>
        </div>

        {isFormOpen && (
          <ItineraryForm
            tripId={tripId}
            places={places}
            existingItems={items}
            item={
              editingId ? items.find((item) => item.id === editingId) : undefined
            }
            date={selectedDate}
            onSaved={handleSaved}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingId(null);
            }}
          />
        )}

        {selectedDayItems.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Nothing planned for this day yet. Use “Add activity” above to plan your day.
          </div>
        ) : (
          <ol className="space-y-3">
            {selectedDayItems.map((item, index) => (
              <li key={item.id} className="rounded-xl border bg-background p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {item.startTime && <span>{item.startTime}</span>}
                          {item.startTime && item.endTime && <span>—</span>}
                          {item.endTime && <span>{item.endTime}</span>}
                        </div>
                        <h4 className="mt-1 font-medium">{item.title}</h4>
                        {item.placeName && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.placeName}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(item, "up")}
                          className="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
                          aria-label={`Move ${item.title} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedDayItems.length - 1}
                          onClick={() => moveItem(item, "down")}
                          className="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
                          aria-label={`Move ${item.title} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-md border px-3 py-1 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-md border px-3 py-1 text-sm font-medium text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
