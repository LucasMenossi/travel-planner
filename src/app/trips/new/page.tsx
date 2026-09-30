import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { TripForm } from "@/components/trips";
import { getSession } from "@/lib/auth-session";

export default async function NewTripPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.isDemo) redirect("/trips");

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/trips"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to trips
        </Link>

        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium tracking-wide text-primary">
            NEW TRIP
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.035em]">
            Plan a new trip
          </h1>

          <p className="text-sm leading-6 text-muted-foreground">
            Add the basics of your trip. You can build your itinerary and
            discover places afterward.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <TripForm />
        </div>
      </div>
    </main>
  );
}
