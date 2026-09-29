import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { TripForm } from "@/components/trips";
import { getSession } from "@/lib/auth-session";
import { getTripById } from "@/server/trips/queries";

type EditTripPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { tripId } = await params;
  const trip = await getTripById(tripId, session.user.id);

  if (!trip) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="space-y-8">
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to trip
        </Link>

        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Edit trip</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update the details for {trip.name}.
          </p>
        </header>

        <section className="rounded-2xl border bg-card p-6">
          <TripForm
            tripId={trip.id}
            initialValues={{
              name: trip.name,
              destination: trip.destination,
              startDate: trip.startDate,
              endDate: trip.endDate,
              coverImageUrl: trip.coverImageUrl ?? "",
            }}
          />
        </section>
      </div>
    </main>
  );
}
