"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { tripSchema, type TripFormData } from "@/lib/validation/trips";

export function CreateTripForm() {
  const router = useRouter();

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
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return;
    }

    router.push("/trips");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Trip name</Label>

        <Input
          id="name"
          placeholder="Summer in Japan"
          aria-invalid={!!errors.name}
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>

        <Input
          id="destination"
          placeholder="Tokyo, Japan"
          aria-invalid={!!errors.destination}
          {...register("destination")}
        />

        {errors.destination && (
          <p className="text-sm text-destructive">
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
            {...register("startDate")}
          />

          {errors.startDate && (
            <p className="text-sm text-destructive">
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
            {...register("endDate")}
          />

          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
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
          {...register("coverImageUrl")}
        />

        {errors.coverImageUrl && (
          <p className="text-sm text-destructive">
            {errors.coverImageUrl.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating trip..." : "Create trip"}
      </Button>
    </form>
  );
}
