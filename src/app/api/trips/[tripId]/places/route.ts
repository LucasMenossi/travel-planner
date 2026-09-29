import { NextResponse } from "next/server";
import { z } from "zod";
import { savePlaceSchema, searchPlacesSchema } from "@/lib/validation/places";
import { searchTripPlaces } from "@/server/places/search-places";
import { savePlace } from "@/server/places/mutations";
import { getSession } from "@/lib/auth-session";

type RouteContext = {
  params: Promise<{
    tripId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { tripId } = await params;

  const url = new URL(request.url);

  const parsed = searchPlacesSchema.safeParse({
    categories: url.searchParams.get("categories"),
    radius: url.searchParams.get("radius") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid search parameters.",
        errors: z.flattenError(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const places = await searchTripPlaces({
      tripId,
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json({
      data: places,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Trip not found.") {
      return NextResponse.json({ message: "Trip not found." }, { status: 404 });
    }

    console.error("Failed to search trip places:", error);

    return NextResponse.json(
      { message: "Failed to search places." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { tripId } = await params;

  const body = await request.json();

  const parsed = savePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid place data.",
        errors: z.flattenError(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const savedPlace = await savePlace({
      tripId,
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json({ data: savedPlace }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Trip not found.") {
      return NextResponse.json({ message: "Trip not found." }, { status: 404 });
    }

    console.error("Failed to save place:", error);

    return NextResponse.json(
      { message: "Failed to save place." },
      { status: 500 },
    );
  }
}
