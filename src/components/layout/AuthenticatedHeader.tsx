import Link from "next/link";
import { Plane } from "lucide-react";

import { SignOutButton } from "@/components/auth";

export function AuthenticatedHeader({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string;
}) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/trips"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="size-4" />
          </span>
          Travel Planner
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            {userName && (
              <p className="text-sm font-medium leading-4">{userName}</p>
            )}
            <p className="text-xs leading-4 text-muted-foreground">
              {userEmail}
            </p>
          </div>

          <div className="h-5 w-px bg-border" aria-hidden="true" />

          <a
            href="https://github.com/LucasMenossi/travel-planner"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Travel Planner on GitHub"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5 fill-current"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.08.78 2.18v3.23c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
