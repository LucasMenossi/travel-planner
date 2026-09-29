import type { Coordinates, GeocodingProvider } from "./types";

const GEOAPIFY_API_URL = "https://api.geoapify.com/v1/geocode/search";

type GeoapifyGeocodingFeature = {
  properties?: {
    lat?: number;
    lon?: number;
  };
};

type GeoapifyGeocodingResponse = {
  features?: GeoapifyGeocodingFeature[];
};

function getApiKey() {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is not configured.");
  }

  return apiKey;
}

export class GeoapifyGeocodingProvider implements GeocodingProvider {
  async geocode(address: string): Promise<Coordinates | null> {
    const searchParams = new URLSearchParams({
      text: address,
      apiKey: getApiKey(),
      limit: "1",
      format: "geojson",
    });

    const response = await fetch(
      `${GEOAPIFY_API_URL}?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Geoapify Geocoding API request failed with status ${response.status}.`,
      );
    }

    const data = (await response.json()) as GeoapifyGeocodingResponse;

    const properties = data.features?.[0]?.properties;

    if (properties?.lat === undefined || properties.lon === undefined) {
      return null;
    }

    return {
      latitude: properties.lat,
      longitude: properties.lon,
    };
  }
}
