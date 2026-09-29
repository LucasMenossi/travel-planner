export type ItineraryItem = {
  id: string;
  placeId: string | null;
  date: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  position: number;
  placeName: string | null;
};
