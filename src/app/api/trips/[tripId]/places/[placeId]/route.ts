import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth-session";
import { deletePlace } from "@/server/places/mutations";

type RouteContext = {
  params: Promise<{
    tripId: string;
    placeId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.isDemo) {
    return NextResponse.json({ error: "Demo accounts are read-only." }, { status: 403 });
  }

  const { tripId, placeId } = await params;

  try {
    const deleted = await deletePlace({
      tripId,
      placeId,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    return new NextResponse(null, {
      status: 204,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to remove place." },
      { status: 500 },
    );
  }
}
