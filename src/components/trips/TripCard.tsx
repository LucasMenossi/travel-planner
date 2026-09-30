import Link from "next/link";
import { CalendarDays, MapPin, Pencil } from "lucide-react";

import { DeleteTripButton } from "./DeleteTripButton";
import type { trip } from "@/lib/db/schema";
import Image from "next/image";

type Trip = typeof trip.$inferSelect;

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg">
      <Link href={`/trips/${trip.id}`} className="group block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {trip.coverImageUrl ? (
            <Image
              src={trip.coverImageUrl}
              alt={`${trip.name} cover`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
              loader={({ src }) => src}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary">
              <MapPin className="size-8 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="space-y-3 p-5 pb-4">
          <div>
            <h2 className="font-semibold tracking-tight">{trip.name}</h2>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>{trip.destination}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-end gap-1 border-t px-4 py-3">
        <Link
          href={`/trips/${trip.id}/edit`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" />
          Edit
        </Link>

        <DeleteTripButton tripId={trip.id} variant="icon" />
      </div>
    </article>
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

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}
