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

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
