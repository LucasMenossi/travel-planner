import { describe, expect, it } from "vitest";

import { createItineraryItemSchema } from "@/lib/validation/itinerary";

describe("createItineraryItemSchema", () => {
  const validItem = {
    date: "2027-04-10",
    title: "Visit Senso-ji",
    startTime: "10:00",
    endTime: "12:00",
    notes: "Arrive early",
    placeId: "place-123",
  };

  it("accepts a valid itinerary item", () => {
    expect(createItineraryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("allows an itinerary item without times", () => {
    const result = createItineraryItemSchema.safeParse({
      ...validItem,
      startTime: null,
      endTime: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an end time before the start time", () => {
    const result = createItineraryItemSchema.safeParse({
      ...validItem,
      startTime: "14:00",
      endTime: "12:00",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["endTime"],
          message: "End time must be on or after start time.",
        }),
      );
    }
  });

  it("rejects an invalid time", () => {
    const result = createItineraryItemSchema.safeParse({
      ...validItem,
      startTime: "25:00",
    });

    expect(result.success).toBe(false);
  });
});
