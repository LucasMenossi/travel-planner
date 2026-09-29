import { z } from "zod";

export const createTripSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Trip name must be at least 2 characters long.")
      .max(100, "Trip name must be 100 characters or less."),

    destination: z
      .string()
      .trim()
      .min(2, "Destination must be at least 2 characters long.")
      .max(100, "Destination must be 100 characters or less."),

    startDate: z.string().min(1, "Select a start date."),

    endDate: z.string().min(1, "Select an end date."),

    coverImageUrl: z
      .string()
      .trim()
      .url("Enter a valid image URL.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type CreateTripFormData = z.infer<typeof createTripSchema>;
