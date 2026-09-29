import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import type { trip } from "@/lib/db/schema";

type Trip = typeof trip.$inferSelect;

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {trip.coverImageUrl ? (
          <img
            src={trip.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <MapPin className="size-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
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
