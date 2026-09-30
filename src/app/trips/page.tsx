import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { TripCard } from "@/components/trips";
import { getSession } from "@/lib/auth-session";
import { getTripsByUserId } from "@/server/trips/queries";

export default async function TripsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const trips = await getTripsByUserId(session.user.id);

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary">
              TRAVEL PLANNER
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
              Your trips
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {trips.length === 0
                ? "Start planning your next adventure."
                : `${trips.length} trip${trips.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {!session.user.isDemo && (
            <Link
              href="/trips/new"
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              New trip
            </Link>
          )}
        </header>

        {session.user.isDemo && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            You are viewing the demo account. This account is read-only, so you
            can explore the trip without changing its data.
          </div>
        )}

        {trips.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <div className="mx-auto max-w-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
                <Plus className="size-5 text-muted-foreground" />
              </div>

              <h2 className="mt-5 font-semibold tracking-tight">
                Your trips will appear here
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first trip to start organizing destinations, places
                and your itinerary.
              </p>

              {!session.user.isDemo && (
                <Link
                  href="/trips/new"
                  className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  Create your first trip
                </Link>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                readOnly={session.user.isDemo}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
