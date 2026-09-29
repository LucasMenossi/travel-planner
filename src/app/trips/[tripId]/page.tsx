import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth-session";
import { getTripById } from "@/server/trips/queries";
import { getPlacesByTripId } from "@/server/places/queries";

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

  const places = await getPlacesByTripId(trip.id);

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to trips
        </Link>

        <header className="mt-8">
          <p className="text-xs font-medium tracking-wide text-primary">TRIP</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            {trip.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              {trip.destination}
            </span>

            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Itinerary</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Your itinerary will appear here.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Saved places</h2>

            {places.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Places you save for this trip will appear here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {places.map((place) => (
                  <li key={place.id}>
                    <p className="font-medium">{place.name}</p>

                    {place.address && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {place.address}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
