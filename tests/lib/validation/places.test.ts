import { describe, expect, it } from "vitest";

import { savePlaceSchema, searchPlacesSchema } from "@/lib/validation/places";

describe("searchPlacesSchema", () => {
  it("parses categories and numeric query parameters", () => {
    const result = searchPlacesSchema.safeParse({
      categories: "catering.restaurant, tourism.sights",
      radius: "5000",
      limit: "10",
      offset: "20",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        categories: ["catering.restaurant", "tourism.sights"],
        radius: 5000,
        limit: 10,
        offset: 20,
      });
    }
  });

  it("rejects an empty category list", () => {
    expect(searchPlacesSchema.safeParse({ categories: " , " }).success).toBe(
      false,
    );
  });

  it("rejects a limit above the provider schema maximum", () => {
    expect(
      searchPlacesSchema.safeParse({
        categories: "catering.restaurant",
        limit: "501",
      }).success,
    ).toBe(false);
  });
});

describe("savePlaceSchema", () => {
  it("accepts a place with optional address and coordinates", () => {
    const result = savePlaceSchema.safeParse({
      externalId: "place-123",
      name: "Senso-ji",
      address: "2-3-1 Asakusa, Taito City, Tokyo",
      latitude: 35.7148,
      longitude: 139.7967,
      category: "tourism.sights",
      imageUrl: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid image URL", () => {
    const result = savePlaceSchema.safeParse({
      externalId: "place-123",
      name: "Senso-ji",
      imageUrl: "invalid-url",
    });

    expect(result.success).toBe(false);
  });
});
