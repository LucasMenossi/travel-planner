import { relations } from "drizzle-orm";
import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "../auth-schema";

export const trip = pgTable(
  "trip",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    destination: text("destination").notNull(),

    startDate: date("start_date", { mode: "string" }).notNull(),

    endDate: date("end_date", { mode: "string" }).notNull(),

    coverImageUrl: text("cover_image_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("trip_user_id_idx").on(table.userId)],
);

export const place = pgTable(
  "place",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),

    externalId: text("external_id").notNull(),

    name: text("name").notNull(),

    address: text("address"),

    latitude: doublePrecision("latitude"),

    longitude: doublePrecision("longitude"),

    category: text("category"),

    imageUrl: text("image_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("place_trip_id_idx").on(table.tripId),
    uniqueIndex("place_trip_external_id_idx").on(
      table.tripId,
      table.externalId,
    ),
  ],
);

export const itineraryItem = pgTable(
  "itinerary_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),

    placeId: text("place_id").references(() => place.id, {
      onDelete: "set null",
    }),

    date: date("date", { mode: "string" }).notNull(),

    title: text("title").notNull(),

    startTime: text("start_time"),

    endTime: text("end_time"),

    notes: text("notes"),

    position: integer("position").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("itinerary_item_trip_id_idx").on(table.tripId),
    uniqueIndex("itinerary_item_position_idx").on(
      table.tripId,
      table.date,
      table.position,
    ),
  ],
);

export const tripRelations = relations(trip, ({ one, many }) => ({
  user: one(user, {
    fields: [trip.userId],
    references: [user.id],
  }),

  places: many(place),

  itineraryItems: many(itineraryItem),
}));

export const placeRelations = relations(place, ({ one, many }) => ({
  trip: one(trip, {
    fields: [place.tripId],
    references: [trip.id],
  }),

  itineraryItems: many(itineraryItem),
}));

export const itineraryItemRelations = relations(itineraryItem, ({ one }) => ({
  trip: one(trip, {
    fields: [itineraryItem.tripId],
    references: [trip.id],
  }),

  place: one(place, {
    fields: [itineraryItem.placeId],
    references: [place.id],
  }),
}));
