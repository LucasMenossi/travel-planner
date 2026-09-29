"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type DeleteTripButtonProps = {
  tripId: string;
  variant?: "icon" | "text";
  redirectTo?: string;
};

export function DeleteTripButton({
  tripId,
  variant = "text",
  redirectTo = "/trips",
}: DeleteTripButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this trip? This will also remove its saved places and itinerary.",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setIsDeleting(false);
      window.alert("Could not delete the trip. Please try again.");
    }
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete trip"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="size-4" />
      {isDeleting ? "Deleting..." : "Delete trip"}
    </Button>
  );
}
