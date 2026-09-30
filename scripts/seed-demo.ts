import "dotenv/config";

import { eq } from "drizzle-orm";

import { auth } from "../src/lib/auth";
import { user } from "../src/lib/auth-schema";
import { db } from "../src/lib/db";
import { itineraryItem, place, trip } from "../src/lib/db/schema";

async function main() {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;
  const name = process.env.DEMO_USER_NAME ?? "Travel Planner Demo";

  if (!email || !password) {
    throw new Error("DEMO_USER_EMAIL and DEMO_USER_PASSWORD are required.");
  }

  let demoUser = (
    await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
  )[0];

  if (!demoUser) {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result.user) {
      throw new Error("Unable to create demo user.");
    }

    demoUser = {
      id: result.user.id,
    };
  }

  await db
    .update(user)
    .set({
      isDemo: true,
      name,
    })
    .where(eq(user.id, demoUser.id));

  let demoTrip = (
    await db
      .select({ id: trip.id })
      .from(trip)
      .where(eq(trip.userId, demoUser.id))
      .limit(1)
  )[0];

  if (!demoTrip) {
    const [created] = await db
      .insert(trip)
      .values({
        userId: demoUser.id,
        name: "Lisbon Weekend",
        destination: "Lisbon, Portugal",
        startDate: "2027-05-14",
        endDate: "2027-05-16",
        coverImageUrl:
          "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
      })
      .returning({
        id: trip.id,
      });

    demoTrip = created;
  }

  const existingPlaces = await db
    .select({
      id: place.id,
    })
    .from(place)
    .where(eq(place.tripId, demoTrip.id));

  if (existingPlaces.length === 0) {
    await db.insert(place).values([
      {
        tripId: demoTrip.id,
        externalId: "demo-praca-do-comercio",
        name: "Praça do Comércio",
        address: "Praça do Comércio, Lisbon, Portugal",
        latitude: 38.7078,
        longitude: -9.1366,
        category: "tourism.sights",
        imageUrl:
          "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        tripId: demoTrip.id,
        externalId: "demo-belem-tower",
        name: "Belém Tower",
        address: "Av. Brasília, Lisbon, Portugal",
        latitude: 38.6916,
        longitude: -9.216,
        category: "tourism.sights",
      },
    ]);
  }

  const existingItems = await db
    .select({
      id: itineraryItem.id,
    })
    .from(itineraryItem)
    .where(eq(itineraryItem.tripId, demoTrip.id));

  if (existingItems.length === 0) {
    const demoPlaces = await db
      .select({
        id: place.id,
      })
      .from(place)
      .where(eq(place.tripId, demoTrip.id));

    await db.insert(itineraryItem).values([
      {
        tripId: demoTrip.id,
        placeId: demoPlaces[0]?.id ?? null,
        date: "2027-05-14",
        title: "Explore Baixa and Praça do Comércio",
        startTime: "10:00",
        endTime: "13:00",
        notes: "Walk through Baixa and continue toward the riverfront.",
        position: 0,
      },
      {
        tripId: demoTrip.id,
        placeId: demoPlaces[1]?.id ?? null,
        date: "2027-05-15",
        title: "Visit Belém",
        startTime: "09:30",
        endTime: "12:30",
        notes: "Visit the tower and explore the riverside area.",
        position: 0,
      },
      {
        tripId: demoTrip.id,
        date: "2027-05-16",
        title: "Free morning",
        notes: "Leave the morning open for a final walk or café stop.",
        position: 0,
      },
    ]);
  }

  console.log(`Demo account ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
