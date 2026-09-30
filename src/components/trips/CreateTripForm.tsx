"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { tripSchema, type TripFormData } from "@/lib/validation/trips";

export function CreateTripForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      coverImageUrl: "",
    },
  });

  async function onSubmit(data: TripFormData) {
    setServerError(null);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setServerError(
          body?.error ?? "Could not create the trip. Please try again.",
        );
        return;
      }

      router.push("/trips");
      router.refresh();
    } catch {
      setServerError("Unable to reach the server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Trip name</Label>

        <Input
          id="name"
          placeholder="Summer in Japan"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />

        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>

        <Input
          id="destination"
          placeholder="Tokyo, Japan"
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? "destination-error" : undefined}
          {...register("destination")}
        />

        {errors.destination && (
          <p id="destination-error" className="text-sm text-destructive">
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>

          <Input
            id="startDate"
            type="date"
            aria-invalid={!!errors.startDate}
          aria-describedby={errors.startDate ? "startDate-error" : undefined}
            {...register("startDate")}
          />

          {errors.startDate && (
            <p id="startDate-error" className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>

          <Input
            id="endDate"
            type="date"
            aria-invalid={!!errors.endDate}
          aria-describedby={errors.endDate ? "endDate-error" : undefined}
            {...register("endDate")}
          />

          {errors.endDate && (
            <p id="endDate-error" className="text-sm text-destructive">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">
          Cover image URL
          <span className="ml-1 text-muted-foreground">(optional)</span>
        </Label>

        <Input
          id="coverImageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          aria-invalid={!!errors.coverImageUrl}
          aria-describedby={errors.coverImageUrl ? "coverImageUrl-error" : undefined}
          {...register("coverImageUrl")}
        />

        {errors.coverImageUrl && (
          <p id="coverImageUrl-error" className="text-sm text-destructive">
            {errors.coverImageUrl.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating trip..." : "Create trip"}
      </Button>
    </form>
  );
}
