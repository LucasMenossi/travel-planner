import type { PlaceResult, PlacesProvider, SearchPlacesParams } from "./types";

const GEOAPIFY_API_URL = "https://api.geoapify.com/v2";

type GeoapifyPlaceProperties = {
  place_id?: string;
  name?: string;
  formatted?: string;
  lat?: number;
  lon?: number;
  categories?: string[];
};

type GeoapifyPlacesResponse = {
  features?: Array<{
    properties?: GeoapifyPlaceProperties;
  }>;
};

function getApiKey() {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is not configured.");
  }

  return apiKey;
}

export class GeoapifyPlacesProvider implements PlacesProvider {
  async searchPlaces(params: SearchPlacesParams): Promise<PlaceResult[]> {
    const searchParams = new URLSearchParams({
      apiKey: getApiKey(),
      categories: params.categories.join(","),
      filter: `circle:${params.longitude},${params.latitude},${params.radius ?? 5000}`,
      limit: String(params.limit ?? 20),
    });

    if (params.offset !== undefined) {
      searchParams.set("offset", String(params.offset));
    }

    if (params.lang) {
      searchParams.set("lang", params.lang);
    }

    const response = await fetch(
      `${GEOAPIFY_API_URL}/places?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Geoapify Places API request failed with status ${response.status}.`,
      );
    }

    const data = (await response.json()) as GeoapifyPlacesResponse;

    return (data.features ?? [])
      .map((feature) => feature.properties)
      .filter((properties): properties is GeoapifyPlaceProperties =>
        Boolean(properties?.place_id && properties.name),
      )
      .map((properties) => normalizePlace(properties));
  }
}

function normalizePlace(properties: GeoapifyPlaceProperties): PlaceResult {
  return {
    externalId: properties.place_id!,
    name: properties.name!,
    address: properties.formatted ?? null,
    latitude: properties.lat ?? null,
    longitude: properties.lon ?? null,
    category: properties.categories?.[0] ?? null,
    imageUrl: null,
  };
}
