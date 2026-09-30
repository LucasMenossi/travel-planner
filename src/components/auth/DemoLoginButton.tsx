"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DemoLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "Unable to open the demo account.");
      }

      router.push("/trips");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to open the demo account.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleDemoLogin}
        disabled={isLoading}
      >
        {isLoading ? "Opening demo..." : "Try the demo"}
      </Button>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
