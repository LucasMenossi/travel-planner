"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

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
      setIsOpen(false);
      setError("Could not delete the trip. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {variant === "icon" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete trip"
              disabled={isDeleting}
              onClick={() => setError(null)}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setError(null)}
            >
              <Trash2 className="size-4" />
              Delete trip
            </Button>
          )}
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this trip?</DialogTitle>
            <DialogDescription>
              This will permanently remove the trip, including its saved places and
              itinerary. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <p role="alert" className="text-right text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
