import { describe, expect, it } from "vitest";

import { tripSchema } from "@/lib/validation/trips";

describe("tripSchema", () => {
  it("accepts a valid trip", () => {
    const result = tripSchema.safeParse({
      name: "Japan 2027",
      destination: "Tokyo",
      startDate: "2027-04-10",
      endDate: "2027-04-17",
      coverImageUrl: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = tripSchema.safeParse({
      name: "Japan 2027",
      destination: "Tokyo",
      startDate: "2027-04-17",
      endDate: "2027-04-10",
      coverImageUrl: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["endDate"],
          message: "End date must be on or after the start date.",
        }),
      );
    }
  });

  it("rejects an invalid cover image URL", () => {
    const result = tripSchema.safeParse({
      name: "Japan 2027",
      destination: "Tokyo",
      startDate: "2027-04-10",
      endDate: "2027-04-17",
      coverImageUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});
