# Travel Planner

A focused travel-planning application built as a portfolio and study project with Next.js, TypeScript, PostgreSQL, and Geoapify.

The MVP lets an authenticated user create trips, discover places near a destination, save places to a trip, organize an itinerary by day, and visualize saved places on a map.

## Highlights

- Next.js App Router with a server-first rendering approach
- TypeScript + React
- Tailwind CSS 4 + shadcn/ui
- Better Auth email/password authentication
- Drizzle ORM + PostgreSQL/Neon
- Geoapify Places and Geocoding integrations behind provider adapters
- MapLibre GL JS for the interactive trip map
- Zod + React Hook Form validation
- Vitest + React Testing Library + Playwright
- Server-side ownership and authorization checks
- Cached external Places/Geocoding requests through Next.js fetch

## Core flows

1. Create an account and sign in.
2. Create a trip with a destination and date range.
3. Discover nearby restaurants, cafés, and attractions.
4. Save places to the trip.
5. Add itinerary activities to specific trip dates.
6. Edit, reorder, and remove itinerary activities.
7. View saved places on the trip map.

## Getting started

### Requirements

- Node.js
- PostgreSQL-compatible database (Neon is used by the project)
- Geoapify API key

### Environment

Copy the example file:

```bash
cp .env.example .env.local
```

Set the following values:

```text
DATABASE_URL=
GEOAPIFY_API_KEY=
NEXT_PUBLIC_GEOAPIFY_API_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Optional portfolio demo account
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=DemoPass@123
DEMO_USER_NAME=Travel Planner Demo
```

`GEOAPIFY_API_KEY` is used server-side for Places and Geocoding. `NEXT_PUBLIC_GEOAPIFY_API_KEY` is used by the browser for the MapLibre map style.

### Install and run

```bash
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

## Database

Generate migrations after schema changes:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Open Drizzle Studio when needed:

```bash
npm run db:studio
```

## Testing

Unit/component tests:

```bash
npm test
```

End-to-end tests:

```bash
npm run test:e2e
```

## Demo account

The portfolio deployment exposes a read-only demo account when `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` are configured. Run `npm run db:seed:demo` against the target database to create the account and deterministic sample data. The login page exposes a **Try the demo** action, so the demo credentials do not need to be shown to visitors.

The demo account is a normal authenticated user marked with `isDemo = true`. It can view its seeded trip, itinerary, saved places, map, and place discovery, but all data mutations are rejected server-side. This is intentionally not a general-purpose role/RBAC system.
