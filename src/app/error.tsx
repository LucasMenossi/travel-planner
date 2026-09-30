"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <section
        role="alert"
        aria-labelledby="error-heading"
        className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm"
      >
        <p className="text-xs font-medium tracking-wide text-primary">
          TRAVEL PLANNER
        </p>
        <h1
          id="error-heading"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We couldn&apos;t load this page. Try again, or return to your trips.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/trips"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to trips
          </Link>
        </div>
      </section>
    </main>
  );
}
