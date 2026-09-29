import { z } from "zod";

export const searchPlacesSchema = z.object({
  categories: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean),
    )
    .refine((categories) => categories.length > 0),

  radius: z.coerce.number().int().positive().optional(),

  limit: z.coerce.number().int().positive().max(500).optional(),

  offset: z.coerce.number().int().min(0).optional(),
});

export type SearchPlacesInput = z.infer<typeof searchPlacesSchema>;

export const savePlaceSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export type SavePlaceInput = z.infer<typeof savePlaceSchema>;
