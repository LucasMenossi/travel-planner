import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <section
        aria-labelledby="not-found-heading"
        className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm"
      >
        <p className="text-xs font-medium tracking-wide text-primary">404</p>
        <h1 id="not-found-heading" className="mt-2 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page or trip you requested could not be found.
        </p>
        <Link
          href="/trips"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to trips
        </Link>
      </section>
    </main>
  );
}
