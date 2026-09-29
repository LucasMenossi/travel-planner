export type SearchPlacesParams = {
  latitude: number;
  longitude: number;
  categories: string[];
  radius?: number;
  limit?: number;
  offset?: number;
  lang?: string;
};

export type PlaceResult = {
  externalId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  imageUrl: string | null;
};

export interface PlacesProvider {
  searchPlaces(params: SearchPlacesParams): Promise<PlaceResult[]>;
}
