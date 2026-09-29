export type Coordinates = {
  latitude: number;
  longitude: number;
};

export interface GeocodingProvider {
  geocode(address: string): Promise<Coordinates | null>;
}
