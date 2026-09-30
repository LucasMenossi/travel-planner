import { and, asc, eq, gt, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { itineraryItem, place, trip } from "@/lib/db/schema";
import { assertCanMutate } from "@/lib/user-access";
import type {
  CreateItineraryItemInput,
  UpdateItineraryItemInput,
} from "@/lib/validation/itinerary";

async function getOwnedTrip(tripId: string, userId: string) {
  const [currentTrip] = await db
    .select()
    .from(trip)
    .where(and(eq(trip.id, tripId), eq(trip.userId, userId)))
    .limit(1);

  return currentTrip ?? null;
}

async function validatePlace(tripId: string, placeId: string | null | undefined) {
  if (!placeId) return;

  const [currentPlace] = await db
    .select({ id: place.id })
    .from(place)
    .where(and(eq(place.id, placeId), eq(place.tripId, tripId)))
    .limit(1);

  if (!currentPlace) {
    throw new Error("Place not found.");
  }
}

function validateDate(date: string, startDate: string, endDate: string) {
  if (date < startDate || date > endDate) {
    throw new Error("Itinerary date must belong to the trip date range.");
  }
}

async function validateTimeOverlap({
  tripId,
  date,
  startTime,
  endTime,
  excludeItemId,
}: {
  tripId: string;
  date: string;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
  excludeItemId?: string;
}) {
  // Activities without a complete time range cannot be compared reliably.
  if (!startTime || !endTime) return;

  const conditions = [
    eq(itineraryItem.tripId, tripId),
    eq(itineraryItem.date, date),
    // Existing interval starts before the new interval ends...
    lt(itineraryItem.startTime, endTime),
    // ...and existing interval ends after the new interval starts.
    gt(itineraryItem.endTime, startTime),
  ];

  if (excludeItemId) {
    conditions.push(sql`${itineraryItem.id} <> ${excludeItemId}`);
  }

  const [overlap] = await db
    .select({ id: itineraryItem.id })
    .from(itineraryItem)
    .where(and(...conditions))
    .limit(1);

  if (overlap) {
    throw new Error("Itinerary time overlaps with another activity.");
  }
}

export async function createItineraryItem(
  input: CreateItineraryItemInput & { tripId: string; userId: string },
) {
  await assertCanMutate(input.userId);

  const currentTrip = await getOwnedTrip(input.tripId, input.userId);

  if (!currentTrip) throw new Error("Trip not found.");

  validateDate(input.date, currentTrip.startDate, currentTrip.endDate);
  await validatePlace(input.tripId, input.placeId);
  await validateTimeOverlap({
    tripId: input.tripId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  const [lastItem] = await db
    .select({ position: itineraryItem.position })
    .from(itineraryItem)
    .where(
      and(eq(itineraryItem.tripId, input.tripId), eq(itineraryItem.date, input.date)),
    )
    .orderBy(sql`${itineraryItem.position} desc`)
    .limit(1);

  const [created] = await db
    .insert(itineraryItem)
    .values({
      tripId: input.tripId,
      placeId: input.placeId ?? null,
      date: input.date,
      title: input.title,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      notes: input.notes?.trim() || null,
      position: (lastItem?.position ?? -1) + 1,
    })
    .returning();

  return created;
}

export async function updateItineraryItem(
  input: UpdateItineraryItemInput & {
    tripId: string;
    itemId: string;
    userId: string;
  },
) {
  await assertCanMutate(input.userId);

  const currentTrip = await getOwnedTrip(input.tripId, input.userId);
  if (!currentTrip) throw new Error("Trip not found.");

  validateDate(input.date, currentTrip.startDate, currentTrip.endDate);
  await validatePlace(input.tripId, input.placeId);

  const [currentItem] = await db
    .select()
    .from(itineraryItem)
    .where(
      and(
        eq(itineraryItem.id, input.itemId),
        eq(itineraryItem.tripId, input.tripId),
      ),
    )
    .limit(1);

  if (!currentItem) throw new Error("Itinerary item not found.");

  await validateTimeOverlap({
    tripId: input.tripId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    excludeItemId: input.itemId,
  });

  if (currentItem.date !== input.date) {
    await db.batch([
      db
        .update(itineraryItem)
        .set({ position: -1 })
        .where(eq(itineraryItem.id, input.itemId)),
      db
        .update(itineraryItem)
        .set({ position: sql`${itineraryItem.position} - 1` })
        .where(
          and(
            eq(itineraryItem.tripId, input.tripId),
            eq(itineraryItem.date, currentItem.date),
            gt(itineraryItem.position, currentItem.position),
          ),
        ),
      db
        .update(itineraryItem)
        .set({
          placeId: input.placeId ?? null,
          date: input.date,
          title: input.title,
          startTime: input.startTime ?? null,
          endTime: input.endTime ?? null,
          notes: input.notes?.trim() || null,
          position: sql`(
            SELECT COALESCE(MAX(${itineraryItem.position}) + 1, 0)
            FROM ${itineraryItem}
            WHERE ${itineraryItem.tripId} = ${input.tripId}
              AND ${itineraryItem.date} = ${input.date}
              AND ${itineraryItem.id} <> ${input.itemId}
          )`,
        })
        .where(eq(itineraryItem.id, input.itemId)),
    ]);
  } else {
    await db
      .update(itineraryItem)
      .set({
        placeId: input.placeId ?? null,
        title: input.title,
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        notes: input.notes?.trim() || null,
      })
      .where(
        and(
          eq(itineraryItem.id, input.itemId),
          eq(itineraryItem.tripId, input.tripId),
        ),
      );
  }

  return getItineraryItem(input.itemId, input.tripId);
}

export async function deleteItineraryItem({
  tripId,
  itemId,
  userId,
}: {
  tripId: string;
  itemId: string;
  userId: string;
}) {
  await assertCanMutate(userId);

  const currentTrip = await getOwnedTrip(tripId, userId);
  if (!currentTrip) throw new Error("Trip not found.");

  const [currentItem] = await db
    .select()
    .from(itineraryItem)
    .where(and(eq(itineraryItem.id, itemId), eq(itineraryItem.tripId, tripId)))
    .limit(1);

  if (!currentItem) throw new Error("Itinerary item not found.");

  await db.batch([
    db.delete(itineraryItem).where(eq(itineraryItem.id, itemId)),
    db
      .update(itineraryItem)
      .set({ position: sql`${itineraryItem.position} - 1` })
      .where(
        and(
          eq(itineraryItem.tripId, tripId),
          eq(itineraryItem.date, currentItem.date),
          gt(itineraryItem.position, currentItem.position),
        ),
      ),
  ]);

  return currentItem;
}

export async function reorderItineraryItem({
  tripId,
  itemId,
  userId,
  direction,
}: {
  tripId: string;
  itemId: string;
  userId: string;
  direction: "up" | "down";
}) {
  await assertCanMutate(userId);

  const currentTrip = await getOwnedTrip(tripId, userId);
  if (!currentTrip) throw new Error("Trip not found.");

  const [currentItem] = await db
    .select()
    .from(itineraryItem)
    .where(and(eq(itineraryItem.id, itemId), eq(itineraryItem.tripId, tripId)))
    .limit(1);

  if (!currentItem) throw new Error("Itinerary item not found.");

  const neighborCondition =
    direction === "up"
      ? and(
          eq(itineraryItem.tripId, tripId),
          eq(itineraryItem.date, currentItem.date),
          lt(itineraryItem.position, currentItem.position),
        )
      : and(
          eq(itineraryItem.tripId, tripId),
          eq(itineraryItem.date, currentItem.date),
          gt(itineraryItem.position, currentItem.position),
        );

  const [neighbor] = await db
    .select()
    .from(itineraryItem)
    .where(neighborCondition)
    .orderBy(
      direction === "up" ? sql`${itineraryItem.position} desc` : asc(itineraryItem.position),
    )
    .limit(1);

  if (!neighbor) return currentItem;

  await db.batch([
    db
      .update(itineraryItem)
      .set({ position: -1 })
      .where(eq(itineraryItem.id, currentItem.id)),
    db
      .update(itineraryItem)
      .set({ position: currentItem.position })
      .where(eq(itineraryItem.id, neighbor.id)),
    db
      .update(itineraryItem)
      .set({ position: neighbor.position })
      .where(eq(itineraryItem.id, currentItem.id)),
  ]);

  return getItineraryItem(itemId, tripId);
}

async function getItineraryItem(itemId: string, tripId: string) {
  const [result] = await db
    .select({
      id: itineraryItem.id,
      tripId: itineraryItem.tripId,
      placeId: itineraryItem.placeId,
      date: itineraryItem.date,
      title: itineraryItem.title,
      startTime: itineraryItem.startTime,
      endTime: itineraryItem.endTime,
      notes: itineraryItem.notes,
      position: itineraryItem.position,
      createdAt: itineraryItem.createdAt,
      updatedAt: itineraryItem.updatedAt,
      placeName: place.name,
    })
    .from(itineraryItem)
    .leftJoin(place, eq(itineraryItem.placeId, place.id))
    .where(and(eq(itineraryItem.id, itemId), eq(itineraryItem.tripId, tripId)))
    .limit(1);

  return result ?? null;
}
