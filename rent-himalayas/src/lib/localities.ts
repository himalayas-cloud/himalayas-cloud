export interface LocalityItem {
  id: string;
  name: string;
  city: "Solan" | "Nahan" | "Shimla";
  coordinates: [number, number]; // [latitude, longitude]
  category?: string;
  popular?: boolean;
}

export const CITY_BASE_COORDINATES: Record<string, [number, number]> = {
  Nahan: [30.5599, 77.2955],
  Solan: [30.9084, 77.0999],
  Shimla: [31.1048, 77.1734],
  All: [30.8200, 77.2000],
};

export const HIMACHAL_LOCALITIES: LocalityItem[] = [
  // ==========================================
  // NAHAN LOCALITIES (ALL HISTORIC & LOCAL MOHALLAS)
  // ==========================================
  { id: "nh-nayabazar", name: "Naya Bazar", city: "Nahan", coordinates: [30.5590, 77.2950], category: "Main Market & Shopping Street", popular: true },
  { id: "nh-badachowk", name: "Bada Chowk", city: "Nahan", coordinates: [30.5580, 77.2945], category: "Historic Central Square & Bazar", popular: true },
  { id: "nh-chhotachowk", name: "Chhota Chowk", city: "Nahan", coordinates: [30.5575, 77.2952], category: "Old Heritage Bazar", popular: true },
  { id: "nh-ranital", name: "Ranital", city: "Nahan", coordinates: [30.5578, 77.2974], category: "Historic Lake & Garden Area", popular: true },
  { id: "nh-gunnu", name: "Gunnu Ghat", city: "Nahan", coordinates: [30.5585, 77.2940], category: "Commercial Hub & Junction", popular: true },
  { id: "nh-kachatank", name: "Kacha Tank", city: "Nahan", coordinates: [30.5630, 77.2925], category: "Residential & Market", popular: true },
  { id: "nh-pakkatank", name: "Pakka Tank", city: "Nahan", coordinates: [30.5615, 77.2945], category: "Heritage Pond & Residences", popular: true },
  { id: "nh-chogan", name: "Chaugan Ground (Chogan)", city: "Nahan", coordinates: [30.5592, 77.2968], category: "Town Center & Promenade", popular: true },
  { id: "nh-delhigate", name: "Delhi Gate", city: "Nahan", coordinates: [30.5562, 77.2938], category: "Historic Entry & Commercial", popular: true },
  { id: "nh-haripur", name: "Haripur Mohalla", city: "Nahan", coordinates: [30.5520, 77.2880], category: "Traditional Residential Mohalla", popular: true },
  { id: "nh-gobindgarh", name: "Gobindgarh Mohalla", city: "Nahan", coordinates: [30.5650, 77.3010], category: "Peaceful Residential Colony", popular: false },
  { id: "nh-medcollege", name: "Medical College (Dr. YSPGMC)", city: "Nahan", coordinates: [30.5645, 77.2910], category: "Hospital & Medical Hub", popular: true },
  { id: "nh-busstand", name: "Nahan Bus Stand", city: "Nahan", coordinates: [30.5605, 77.2980], category: "Transit & Market", popular: true },
  { id: "nh-mahamaya", name: "Mahamaya Temple Road", city: "Nahan", coordinates: [30.5570, 77.2960], category: "Temple Area & Residences", popular: false },
  { id: "nh-kalisthan", name: "Kalisthan Road", city: "Nahan", coordinates: [30.5610, 77.2930], category: "Historic Kalisthan Temple", popular: false },
  { id: "nh-valmiki", name: "Valmiki Nagar", city: "Nahan", coordinates: [30.5550, 77.2970], category: "Residential Neighborhood", popular: false },
  { id: "nh-gwaltoli", name: "Gwal Toli", city: "Nahan", coordinates: [30.5535, 77.2920], category: "Local Mohalla", popular: false },
  { id: "nh-cantt", name: "Cantt Area / Trilokpur Road", city: "Nahan", coordinates: [30.5540, 77.2990], category: "Army Cantt & Outskirts", popular: false },
  { id: "nh-shambhuwala", name: "Shambhuwala", city: "Nahan", coordinates: [30.5750, 77.3250], category: "Highway Suburb", popular: false },
  { id: "nh-jamta", name: "Jamta Heights", city: "Nahan", coordinates: [30.6080, 77.3050], category: "Scenic Ridge & Resorts", popular: false },

  // ==========================================
  // SOLAN LOCALITIES
  // ==========================================
  { id: "sl-mallroad", name: "Mall Road", city: "Solan", coordinates: [30.9084, 77.0999], category: "Commercial Heart", popular: true },
  { id: "sl-chambaghat", name: "Chambaghat", city: "Solan", coordinates: [30.9230, 77.1080], category: "Industrial & Mushroom City", popular: true },
  { id: "sl-saproon", name: "Saproon", city: "Solan", coordinates: [30.8980, 77.0920], category: "Residential & Market Hub", popular: true },
  { id: "sl-kotlanala", name: "Kotlanala", city: "Solan", coordinates: [30.9020, 77.1040], category: "Student Hub & Rental Flats", popular: true },
  { id: "sl-deunghat", name: "Deunghat", city: "Solan", coordinates: [30.9150, 77.1120], category: "Commercial Center", popular: true },
  { id: "sl-rabon", name: "Rabon", city: "Solan", coordinates: [30.9010, 77.1180], category: "Peaceful Residential", popular: true },
  { id: "sl-thodo", name: "Thodo Ground / Old DC Office", city: "Solan", coordinates: [30.9050, 77.0980], category: "Center & Sports Complex", popular: true },
  { id: "sl-gungun", name: "Gungun Bazar / Anand Complex", city: "Solan", coordinates: [30.9075, 77.1010], category: "Shopping Bazar", popular: false },
  { id: "sl-tankroad", name: "Tank Road", city: "Solan", coordinates: [30.9060, 77.0960], category: "Central Solan", popular: false },
  { id: "sl-barog", name: "Barog", city: "Solan", coordinates: [30.8900, 77.0600], category: "Scenic Suburb & Toy Train Station", popular: true },
  { id: "sl-kumarhatti", name: "Kumarhatti", city: "Solan", coordinates: [30.8820, 77.0500], category: "Junction & University Hub", popular: true },
  { id: "sl-shoolini", name: "Shoolini University / Oachghat", city: "Solan", coordinates: [30.8750, 77.1250], category: "College Campus Area", popular: true },
  { id: "sl-bypass", name: "Solan Bypass Road", city: "Solan", coordinates: [30.9120, 77.1050], category: "NH Highway Flats", popular: false },
  { id: "sl-basal", name: "Basal Road", city: "Solan", coordinates: [30.8950, 77.0850], category: "Suburban Neighborhood", popular: false },

  // ==========================================
  // SHIMLA LOCALITIES
  // ==========================================
  { id: "sh-ridge", name: "The Ridge / Mall Road", city: "Shimla", coordinates: [31.1048, 77.1734], category: "Cultural Heart & Promenade", popular: true },
  { id: "sh-lowerbazar", name: "Lower Bazar", city: "Shimla", coordinates: [31.1035, 77.1725], category: "Central Wholesale & Retail Market", popular: true },
  { id: "sh-middlebazar", name: "Middle Bazar", city: "Shimla", coordinates: [31.1040, 77.1730], category: "Commercial Heart", popular: false },
  { id: "sh-lakkar", name: "Lakkar Bazaar", city: "Shimla", coordinates: [31.1070, 77.1755], category: "Wooden Craft & Central Stays", popular: true },
  { id: "sh-sanjauli", name: "Sanjauli", city: "Shimla", coordinates: [31.1015, 77.1950], category: "Major Student & Rental Hub", popular: true },
  { id: "sh-chhotashimla", name: "Chhota Shimla", city: "Shimla", coordinates: [31.0920, 77.1820], category: "VIP & Residential Hub", popular: true },
  { id: "sh-newshimla", name: "New Shimla (Sector 1-5)", city: "Shimla", coordinates: [31.0780, 77.1720], category: "Planned Housing Colony", popular: true },
  { id: "sh-boileauganj", name: "Boileauganj", city: "Shimla", coordinates: [31.1030, 77.1430], category: "West Shimla Hub", popular: false },
  { id: "sh-summerhill", name: "Summer Hill (HPU)", city: "Shimla", coordinates: [31.1110, 77.1350], category: "University Campus Area", popular: true },
  { id: "sh-kasumpti", name: "Kasumpti", city: "Shimla", coordinates: [31.0850, 77.1850], category: "Government Offices & Flats", popular: true },
  { id: "sh-jakhoo", name: "Jakhoo Hill", city: "Shimla", coordinates: [31.1010, 77.1810], category: "High Altitude Scenic Stays", popular: false },
  { id: "sh-dhalli", name: "Dhalli", city: "Shimla", coordinates: [31.1150, 77.2050], category: "Apple Market & Tunnel Junction", popular: true },
  { id: "sh-tutu", name: "Tutu / Airport Road", city: "Shimla", coordinates: [31.1120, 77.1210], category: "Suburban Flats", popular: false },
  { id: "sh-kaithu", name: "Kaithu", city: "Shimla", coordinates: [31.1090, 77.1620], category: "Close to Mall Road", popular: false },
  { id: "sh-vikasnagar", name: "Vikasnagar", city: "Shimla", coordinates: [31.0880, 77.1780], category: "High Rental Demand", popular: true },
  { id: "sh-khalini", name: "Khalini / BCS", city: "Shimla", coordinates: [31.0890, 77.1680], category: "School Area & Forest Views", popular: false },
  { id: "sh-mehli", name: "Mehli", city: "Shimla", coordinates: [31.0720, 77.1950], category: "New Housing Suburb", popular: false },
  { id: "sh-mashobra", name: "Mashobra", city: "Shimla", coordinates: [31.1300, 77.2300], category: "Pine Woods & Stays", popular: false },
];

/**
 * Filter localities matching query and optional city filter
 */
export function searchLocalities(query: string, city?: string): LocalityItem[] {
  const q = query.trim().toLowerCase();
  return HIMACHAL_LOCALITIES.filter((loc) => {
    if (city && city !== "All" && loc.city.toLowerCase() !== city.toLowerCase()) return false;
    if (!q) return loc.popular; // Show popular by default when query is empty
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      (loc.category && loc.category.toLowerCase().includes(q))
    );
  });
}

/**
 * Try to resolve exact coordinates for a given locality string & city
 */
export function getCoordinatesForLocality(
  localityName: string,
  cityName?: string
): [number, number] | null {
  if (!localityName || !localityName.trim()) return null;
  const lLower = localityName.trim().toLowerCase();

  // 1. Direct or partial name match
  const match = HIMACHAL_LOCALITIES.find((loc) => {
    const locLower = loc.name.toLowerCase();
    const cityMatch = !cityName || cityName === "All" || loc.city.toLowerCase() === cityName.toLowerCase();
    return cityMatch && (lLower.includes(locLower) || locLower.includes(lLower));
  });

  if (match) return match.coordinates;

  // 2. Word-based token matching (e.g. "bada chowk near temple" matches "Bada Chowk")
  const tokens = lLower.split(/[\s,]+/);
  for (const loc of HIMACHAL_LOCALITIES) {
    const cityMatch = !cityName || cityName === "All" || loc.city.toLowerCase() === cityName.toLowerCase();
    if (!cityMatch) continue;
    const locTokens = loc.name.toLowerCase().split(/[\s,]+/);
    if (locTokens.some((t) => t.length > 3 && tokens.includes(t))) {
      return loc.coordinates;
    }
  }

  return null;
}

/**
 * GUARANTEED SAFE COORDINATES:
 * Returns exact coordinates if matched, OR safely defaults to the city's geographical center
 * with a deterministic micro-offset. NEVER returns null, undefined, or NaN!
 */
export function getSafeCoordinates(
  localityName?: string,
  cityName?: "Solan" | "Nahan" | "Shimla" | string
): [number, number] {
  const safeCity = cityName && typeof cityName === "string" && CITY_BASE_COORDINATES[cityName]
    ? cityName
    : "Nahan";
  const base = CITY_BASE_COORDINATES[safeCity] || [30.5599, 77.2955];

  if (!localityName || typeof localityName !== "string" || !localityName.trim()) {
    return [base[0], base[1]];
  }

  const cleanLocality = localityName.trim();
  const matched = getCoordinatesForLocality(cleanLocality, safeCity);
  if (
    matched &&
    Array.isArray(matched) &&
    matched.length === 2 &&
    typeof matched[0] === "number" &&
    typeof matched[1] === "number" &&
    !isNaN(matched[0]) &&
    !isNaN(matched[1])
  ) {
    return [matched[0], matched[1]];
  }

  // Create small deterministic offset from locality name string hash
  let hash = 0;
  for (let i = 0; i < cleanLocality.length; i++) {
    hash = (hash << 5) - hash + cleanLocality.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 19) - 9) * 0.0007;
  const lngOffset = ((Math.abs(hash >> 3) % 19) - 9) * 0.0007;

  const lat = Number((base[0] + latOffset).toFixed(5));
  const lng = Number((base[1] + lngOffset).toFixed(5));

  if (isNaN(lat) || isNaN(lng)) {
    return [base[0], base[1]];
  }
  return [lat, lng];
}

/**
 * Universal safe parser that guarantees valid [lat, lng] numbers under any condition
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseValidCoordinates(raw: any, fallbackCity?: string, fallbackLocality?: string): [number, number] {
  if (Array.isArray(raw) && raw.length >= 2) {
    const lat = Number(raw[0]);
    const lng = Number(raw[1]);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
      return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
    }
  }

  if (raw && typeof raw === "object") {
    const lat = Number(raw.lat ?? raw.latitude);
    const lng = Number(raw.lng ?? raw.longitude);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
      return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
    }
  }

  return getSafeCoordinates(fallbackLocality, fallbackCity);
}

