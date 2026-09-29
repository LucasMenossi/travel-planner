export type SearchPlacesParams = {
  latitude: number;
  longitude: number;
  categories: string[];
  radius?: number;
  limit?: number;
  offset?: number;
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

export type SavedPlace = PlaceResult & {
  id: string;
  createdAt: string;
};

export interface PlacesProvider {
  searchPlaces(params: SearchPlacesParams): Promise<PlaceResult[]>;
}
