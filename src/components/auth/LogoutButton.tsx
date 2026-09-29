"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    setError(false);

    const { error: signOutError } = await authClient.signOut();

    if (signOutError) {
      setError(true);
      setIsLoading(false);
      return;
    }

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-sm text-destructive">
          Unable to sign out.
        </span>
      )}

      <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {isLoading ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
