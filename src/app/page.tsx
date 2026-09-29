import Link from "next/link";
import { MapPin, Plane, Route } from "lucide-react";

import { SignupForm } from "@/components/auth";

export default function SignupPage() {
  return (
    <main className="min-h-svh bg-background p-3 md:p-4">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl overflow-hidden rounded-3xl border bg-card shadow-[0_24px_80px_-32px_rgba(30,30,30,0.25)] md:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#18232B] p-8 text-white md:flex md:flex-col">
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E76F51]">
              <Plane className="size-4" strokeWidth={2.5} />
            </div>

            <span className="text-sm font-semibold tracking-tight">
              Travel Planner
            </span>
          </div>

          <div className="relative z-10 mt-auto max-w-sm">
            <p className="mb-3 text-xs font-medium tracking-wide text-[#E76F51]">
              YOUR TRIP, YOUR WAY
            </p>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em]">
              Turn places you want to visit into a trip worth remembering.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              Organize your itinerary, save places and see your plans come
              together on the map.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex items-center gap-6 border-t border-white/10 pt-4 text-xs text-white/45">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Places
            </span>

            <span className="flex items-center gap-1.5">
              <Route className="size-3.5" />
              Itinerary
            </span>

            <span className="flex items-center gap-1.5">
              <Plane className="size-3.5" />
              Trips
            </span>
          </div>

          <div
            aria-hidden="true"
            className="absolute -right-20 top-1/2 size-80 -translate-y-1/2 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-8 top-1/2 size-56 -translate-y-1/2 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute right-32 top-[48%] size-3 rounded-full bg-[#E76F51] shadow-[0_0_0_8px_rgba(231,111,81,0.12)]"
          />
        </section>

        <section className="flex items-center justify-center px-6 py-8 md:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-6 md:hidden">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold tracking-tight"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Plane className="size-4" />
                </span>
                Travel Planner
              </Link>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-xs font-medium tracking-wide text-primary">
                GET STARTED
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                Create your account
              </h2>

              <p className="max-w-sm text-sm leading-5 text-muted-foreground">
                Start planning your next adventure and keep your itinerary in
                one place.
              </p>
            </div>

            <SignupForm />

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
