import { db } from "@/lib/db";
import { trip } from "@/lib/db/schema";

type CreateTripInput = {
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
};

export async function createTrip(input: CreateTripInput) {
  const [createdTrip] = await db
    .insert(trip)
    .values({
      userId: input.userId,
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      coverImageUrl: input.coverImageUrl?.trim() || null,
    })
    .returning();

  return createdTrip;
}
