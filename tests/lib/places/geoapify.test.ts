import { beforeEach, describe, expect, it, vi } from "vitest";

import { GeoapifyPlacesProvider } from "@/lib/places/geoapify";

describe("GeoapifyPlacesProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GEOAPIFY_API_KEY = "test-api-key";
  });

  it("normalizes Geoapify places into the application place shape", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            {
              properties: {
                place_id: "place-123",
                name: "Senso-ji",
                formatted: "2-3-1 Asakusa, Taito City, Tokyo",
                lat: 35.7148,
                lon: 139.7967,
                categories: ["tourism.sights", "tourism"],
              },
            },
            {
              properties: {
                place_id: "place-456",
                name: "Blue Bottle Coffee",
                categories: ["catering.cafe"],
              },
            },
            {
              properties: {
                name: "Missing ID",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const provider = new GeoapifyPlacesProvider();
    const result = await provider.searchPlaces({
      categories: ["tourism.sights"],
      latitude: 35.6762,
      longitude: 139.6503,
      radius: 5000,
      limit: 10,
      offset: 20,
    });

    expect(result).toEqual([
      {
        externalId: "place-123",
        name: "Senso-ji",
        address: "2-3-1 Asakusa, Taito City, Tokyo",
        latitude: 35.7148,
        longitude: 139.7967,
        category: "tourism.sights",
        imageUrl: null,
      },
      {
        externalId: "place-456",
        name: "Blue Bottle Coffee",
        address: null,
        latitude: null,
        longitude: null,
        category: "catering.cafe",
        imageUrl: null,
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.pathname).toBe("/v2/places");
    expect(requestUrl.searchParams.get("apiKey")).toBe("test-api-key");
    expect(requestUrl.searchParams.get("categories")).toBe("tourism.sights");
    expect(requestUrl.searchParams.get("filter")).toBe(
      "circle:139.6503,35.6762,5000",
    );
    expect(requestUrl.searchParams.get("limit")).toBe("10");
    expect(requestUrl.searchParams.get("offset")).toBe("20");
    expect(requestUrl.searchParams.get("lang")).toBe("en");

    expect(fetchMock.mock.calls[0][1]).toEqual({
      next: { revalidate: 300 },
    });
  });

  it("throws when the Geoapify request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 429 }),
    );

    const provider = new GeoapifyPlacesProvider();

    await expect(
      provider.searchPlaces({
        categories: ["catering.restaurant"],
        latitude: 35.6762,
        longitude: 139.6503,
      }),
    ).rejects.toThrow("Geoapify Places API request failed with status 429.");
  });

  it("throws when the API key is not configured", async () => {
    delete process.env.GEOAPIFY_API_KEY;

    const fetchMock = vi.spyOn(globalThis, "fetch");
    const provider = new GeoapifyPlacesProvider();

    await expect(
      provider.searchPlaces({
        categories: ["catering.restaurant"],
        latitude: 35.6762,
        longitude: 139.6503,
      }),
    ).rejects.toThrow("GEOAPIFY_API_KEY is not configured.");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
