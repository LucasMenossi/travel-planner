import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { PlacesSection } from "@/components/places/PlacesSection";
import { getSession } from "@/lib/auth-session";
import { getPlacesByTripId } from "@/server/places/queries";
import { getTripById } from "@/server/trips/queries";

type TripPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripPage({ params }: TripPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { tripId } = await params;

  const trip = await getTripById(tripId, session.user.id);

  if (!trip) {
    notFound();
  }

  const places = await getPlacesByTripId(trip.id, session.user.id);

  const serializedPlaces = places.map((place) => ({
    ...place,
    createdAt: place.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-8">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to trips
        </Link>

        <header className="space-y-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {trip.name}
            </h1>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {trip.destination && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{trip.destination}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                <span>
                  {trip.startDate} — {trip.endDate}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">Itinerary</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your itinerary will appear here.
          </p>
        </section>

        <PlacesSection tripId={trip.id} initialPlaces={serializedPlaces} />
      </div>
    </main>
  );
}
