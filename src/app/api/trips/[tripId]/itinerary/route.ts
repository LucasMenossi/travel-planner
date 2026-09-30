import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth-session";
import { createItineraryItemSchema } from "@/lib/validation/itinerary";
import { createItineraryItem } from "@/server/itinerary/mutations";
import { getItineraryItemsByTripId } from "@/server/itinerary/queries";

 type RouteContext = {
  params: Promise<{ tripId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { tripId } = await params;
  const items = await getItineraryItemsByTripId(tripId, session.user.id);

  return NextResponse.json({ data: items });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  if (session.user.isDemo) return NextResponse.json({ message: "Demo accounts are read-only." }, { status: 403 });

  const { tripId } = await params;
  const parsed = createItineraryItemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid itinerary item.", errors: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const item = await createItineraryItem({
      ...parsed.data,
      tripId,
      userId: session.user.id,
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Trip not found.") {
        return NextResponse.json({ message: "Trip not found." }, { status: 404 });
      }
      if (error.message === "Place not found.") {
        return NextResponse.json({ message: "Place not found." }, { status: 404 });
      }
      if (error.message.includes("date range") || error.message.includes("time overlaps")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
    }

    console.error("Failed to create itinerary item:", error);
    return NextResponse.json({ message: "Failed to create itinerary item." }, { status: 500 });
  }
}
