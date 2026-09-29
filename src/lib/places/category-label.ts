const CATEGORY_LABELS: Record<string, string> = {
  catering: "Food & Dining",
  building: "Building",
  man_made: "Landmark",
  tourism: "Tourism",
  entertainment: "Entertainment",
  commercial: "Shopping",
  leisure: "Leisure",
  accommodation: "Accommodation",
  natural: "Nature",
  heritage: "Heritage",
  activity: "Activity",
  education: "Education",
  healthcare: "Healthcare",
  service: "Services",
  religion: "Religious Site",
  amenity: "Amenity",
  sport: "Sports",
  office: "Office",
  public_transport: "Public Transport",
  parking: "Parking",
  airport: "Airport",
  railway: "Railway",
};

const SPECIFIC_CATEGORY_LABELS: Record<string, string> = {
  "catering.restaurant": "Restaurant",
  "catering.cafe": "Café",
  "catering.fast_food": "Fast Food",
  "catering.bar": "Bar",
  "catering.pub": "Pub",
  "catering.ice_cream": "Ice Cream",
  "tourism.attraction": "Attraction",
  "tourism.museum": "Museum",
  "tourism.gallery": "Gallery",
  "tourism.information": "Tourist Information",
  "commercial.shopping_mall": "Shopping Mall",
  "commercial.supermarket": "Supermarket",
  "commercial.marketplace": "Marketplace",
  "accommodation.hotel": "Hotel",
  "accommodation.hostel": "Hostel",
  "accommodation.guest_house": "Guest House",
  "leisure.park": "Park",
  "leisure.playground": "Playground",
  "leisure.sports_centre": "Sports Centre",
  "entertainment.cinema": "Cinema",
  "entertainment.theatre": "Theatre",
  "building.place_of_worship": "Place of Worship",
  "healthcare.hospital": "Hospital",
  "healthcare.pharmacy": "Pharmacy",
  "service.beauty": "Beauty",
  "sport.stadium": "Stadium",
  "sport.golf": "Golf",
};

function humanizeCategory(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getCategoryLabel(category: string | null | undefined) {
  if (!category) return null;

  const normalized = category.trim().toLowerCase();

  if (SPECIFIC_CATEGORY_LABELS[normalized]) {
    return SPECIFIC_CATEGORY_LABELS[normalized];
  }

  const rootCategory = normalized.split(".")[0];

  return CATEGORY_LABELS[rootCategory] ?? humanizeCategory(rootCategory);
}
