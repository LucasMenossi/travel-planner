"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tripSchema, type TripFormData } from "@/lib/validation/trips";

type TripFormProps = {
  tripId?: string;
  initialValues?: TripFormData;
};

export function TripForm({ tripId, initialValues }: TripFormProps) {
  const router = useRouter();
  const isEditing = Boolean(tripId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: initialValues ?? {
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      coverImageUrl: "",
    },
  });

  async function onSubmit(data: TripFormData) {
    const response = await fetch(
      tripId ? `/api/trips/${tripId}` : "/api/trips",
      {
        method: tripId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);

      setError("root", {
        message:
          body?.error ??
          (isEditing
            ? "Could not update the trip. Please try again."
            : "Could not create the trip. Please try again."),
      });
      return;
    }

    const updatedTrip = await response.json();

    router.push(`/trips${isEditing ? `/${updatedTrip.id}` : ""}`);
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

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Saving changes..."
              : "Creating trip..."
            : isEditing
              ? "Save changes"
              : "Create trip"}
        </Button>
      </div>
    </form>
  );
}
