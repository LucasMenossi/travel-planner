import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth-session";
import { tripSchema } from "@/lib/validation/trips";
import { deleteTrip, updateTrip } from "@/server/trips/mutations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.isDemo) {
    return NextResponse.json({ error: "Demo accounts are read-only." }, { status: 403 });
  }

  const { tripId } = await params;
  const body = await request.json();
  const result = tripSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request data.",
        issues: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  let updatedTrip: Awaited<ReturnType<typeof updateTrip>>;

  try {
    updatedTrip = await updateTrip({
      tripId,
      userId: session.user.id,
      ...result.data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TRIP_DATE_RANGE_CONFLICT") {
      return NextResponse.json(
        { error: "Trip dates cannot exclude existing itinerary activities." },
        { status: 409 },
      );
    }

    throw error;
  }

  if (!updatedTrip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json(updatedTrip);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.isDemo) {
    return NextResponse.json({ error: "Demo accounts are read-only." }, { status: 403 });
  }

  const { tripId } = await params;
  const deletedTrip = await deleteTrip(tripId, session.user.id);

  if (!deletedTrip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
