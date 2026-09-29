import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.")
  .nullable()
  .optional();

export const createItineraryItemSchema = z
  .object({
    date: z.string().min(1, "Select a day."),
    title: z.string().trim().min(1, "Title is required.").max(200),
    startTime: timeSchema,
    endTime: timeSchema,
    notes: z.string().trim().max(2000).nullable().optional(),
    placeId: z.string().min(1).nullable().optional(),
  })
  .refine(
    (data) =>
      !data.startTime || !data.endTime || data.endTime >= data.startTime,
    {
      message: "End time must be on or after start time.",
      path: ["endTime"],
    },
  );

export const updateItineraryItemSchema = createItineraryItemSchema;

export type CreateItineraryItemInput = z.infer<
  typeof createItineraryItemSchema
>;
export type UpdateItineraryItemInput = z.infer<
  typeof updateItineraryItemSchema
>;

export const reorderItineraryItemSchema = z.object({
  direction: z.enum(["up", "down"]),
});
