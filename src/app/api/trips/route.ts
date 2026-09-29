import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth-session";
import { createTrip } from "@/server/trips/mutations";
import { tripSchema } from "@/lib/validation/trips";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const createdTrip = await createTrip({
    userId: session.user.id,
    name: result.data.name,
    destination: result.data.destination,
    startDate: result.data.startDate,
    endDate: result.data.endDate,
    coverImageUrl: result.data.coverImageUrl,
  });

  return NextResponse.json(createdTrip, { status: 201 });
}
