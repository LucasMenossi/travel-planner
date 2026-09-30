import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth-session";
import {
  reorderItineraryItemSchema,
  updateItineraryItemSchema,
} from "@/lib/validation/itinerary";
import {
  deleteItineraryItem,
  reorderItineraryItem,
  updateItineraryItem,
} from "@/server/itinerary/mutations";

type RouteContext = {
  params: Promise<{ tripId: string; itemId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (session.user.isDemo) {
    return NextResponse.json({ message: "Demo accounts are read-only." }, { status: 403 });
  }

  const { tripId, itemId } = await params;
  const body = await request.json();

  const reorderParsed = reorderItineraryItemSchema.safeParse(body);
  if (reorderParsed.success) {
    try {
      const item = await reorderItineraryItem({
        ...reorderParsed.data,
        tripId,
        itemId,
        userId: session.user.id,
      });
      return NextResponse.json({ data: item });
    } catch (error) {
      return handleMutationError(error, "reorder itinerary item");
    }
  }

  const parsed = updateItineraryItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid itinerary item.",
        errors: z.flattenError(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const item = await updateItineraryItem({
      ...parsed.data,
      tripId,
      itemId,
      userId: session.user.id,
    });
    return NextResponse.json({ data: item });
  } catch (error) {
    return handleMutationError(error, "update itinerary item");
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (session.user.isDemo) {
    return NextResponse.json({ message: "Demo accounts are read-only." }, { status: 403 });
  }

  const { tripId, itemId } = await params;

  try {
    const item = await deleteItineraryItem({
      tripId,
      itemId,
      userId: session.user.id,
    });
    return NextResponse.json({ data: item });
  } catch (error) {
    return handleMutationError(error, "delete itinerary item");
  }
}

function handleMutationError(error: unknown, operation: string) {
  if (error instanceof Error) {
    if (error.message === "Trip not found.") {
      return NextResponse.json({ message: "Trip not found." }, { status: 404 });
    }

    if (error.message === "Itinerary item not found.") {
      return NextResponse.json(
        { message: "Itinerary item not found." },
        { status: 404 },
      );
    }

    if (error.message === "Place not found.") {
      return NextResponse.json({ message: "Place not found." }, { status: 404 });
    }

    if (error.message.includes("date range")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error.message.includes("time overlaps")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
  }

  console.error(`Failed to ${operation}:`, error);
  return NextResponse.json(
    { message: `Failed to ${operation}.` },
    { status: 500 },
  );
}
