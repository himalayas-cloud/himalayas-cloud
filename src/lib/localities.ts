export interface LocalityItem {
  id: string;
  name: string;
  city: string;
  district?: string;
  coordinates: [number, number]; // [latitude, longitude]
  category?: string;
  popular?: boolean;
}

export interface DistrictTownItem {
  name: string;
  district: string;
  coordinates: [number, number];
  popular?: boolean;
}

// Active Target Launch Districts: Sirmaur, Solan, Shimla
export const HIMACHAL_DISTRICTS: string[] = [
  "Sirmaur",
  "Solan",
  "Shimla",
];

// Towns & Sub-Divisions grouped by District
export const HIMACHAL_DISTRICT_DATA: Record<string, { center: [number, number]; towns: DistrictTownItem[] }> = {
  Sirmaur: {
    center: [30.5599, 77.2955],
    towns: [
      { name: "Nahan", district: "Sirmaur", coordinates: [30.5599, 77.2955], popular: true },
      { name: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4435, 77.6253], popular: true },
      { name: "Kala Amb", district: "Sirmaur", coordinates: [30.4950, 77.2150], popular: true },
      { name: "Shillai", district: "Sirmaur", coordinates: [30.6872, 77.7212], popular: true },
      { name: "Rajgarh", district: "Sirmaur", coordinates: [30.8524, 77.3050], popular: true },
      { name: "Dadahu / Renuka Ji", district: "Sirmaur", coordinates: [30.6050, 77.4520], popular: true },
      { name: "Sarahan / Pacchad", district: "Sirmaur", coordinates: [30.7480, 77.2180], popular: false },
      { name: "Kafota", district: "Sirmaur", coordinates: [30.5890, 77.6320], popular: false },
      { name: "Haripurdhar", district: "Sirmaur", coordinates: [30.7710, 77.5180], popular: false },
      { name: "Majra", district: "Sirmaur", coordinates: [30.4680, 77.5320], popular: false },
      { name: "Dhaulakuan", district: "Sirmaur", coordinates: [30.5050, 77.4650], popular: false },
      { name: "Trilokpur", district: "Sirmaur", coordinates: [30.5140, 77.2350], popular: false },
      { name: "Giri Nagar", district: "Sirmaur", coordinates: [30.4920, 77.5850], popular: false },
    ],
  },
  Solan: {
    center: [30.9084, 77.0999],
    towns: [
      { name: "Solan City", district: "Solan", coordinates: [30.9084, 77.0999], popular: true },
      { name: "Baddi", district: "Solan", coordinates: [30.9578, 76.7914], popular: true },
      { name: "Barotiwala", district: "Solan", coordinates: [30.9250, 76.8400], popular: true },
      { name: "Nalagarh", district: "Solan", coordinates: [31.0420, 76.7200], popular: true },
      { name: "Dharampur", district: "Solan", coordinates: [30.9050, 77.0250], popular: true },
      { name: "Kandaghat", district: "Solan", coordinates: [30.9650, 77.1120], popular: false },
      { name: "Kumarhatti", district: "Solan", coordinates: [30.8870, 77.0480], popular: false },
      { name: "Kasauli", district: "Solan", coordinates: [30.9013, 76.9649], popular: true },
      { name: "Parwanoo", district: "Solan", coordinates: [30.8350, 76.9600], popular: true },
      { name: "Arki", district: "Solan", coordinates: [31.1510, 76.9680], popular: false },
      { name: "Chail", district: "Solan", coordinates: [30.9730, 77.1900], popular: false },
    ],
  },
  Shimla: {
    center: [31.1048, 77.1734],
    towns: [
      { name: "Shimla City", district: "Shimla", coordinates: [31.1048, 77.1734], popular: true },
      { name: "Sanjauli", district: "Shimla", coordinates: [31.1015, 77.1950], popular: true },
      { name: "New Shimla", district: "Shimla", coordinates: [31.0780, 77.1720], popular: true },
      { name: "Dhalli", district: "Shimla", coordinates: [31.1150, 77.2050], popular: true },
      { name: "Summer Hill", district: "Shimla", coordinates: [31.1110, 77.1350], popular: true },
      { name: "Theog", district: "Shimla", coordinates: [31.1210, 77.3550], popular: true },
      { name: "Rampur Bushahr", district: "Shimla", coordinates: [31.4490, 77.6350], popular: true },
      { name: "Rohru", district: "Shimla", coordinates: [31.2050, 77.7520], popular: true },
      { name: "Kotkhai", district: "Shimla", coordinates: [31.1200, 77.5300], popular: false },
      { name: "Jubbal", district: "Shimla", coordinates: [31.1100, 77.6650], popular: false },
      { name: "Kufri", district: "Shimla", coordinates: [31.0980, 77.2680], popular: false },
      { name: "Mashobra", district: "Shimla", coordinates: [31.1300, 77.2300], popular: false },
    ],
  },
  Kangra: {
    center: [32.2190, 76.3234],
    towns: [
      { name: "Dharamshala", district: "Kangra", coordinates: [32.2190, 76.3234], popular: true },
      { name: "McLeod Ganj", district: "Kangra", coordinates: [32.2426, 76.3213], popular: true },
      { name: "Palampur", district: "Kangra", coordinates: [32.1109, 76.5363], popular: true },
      { name: "Kangra Town", district: "Kangra", coordinates: [32.0998, 76.2691], popular: true },
      { name: "Nurpur", district: "Kangra", coordinates: [32.3015, 75.8920], popular: false },
      { name: "Baijnath", district: "Kangra", coordinates: [32.0520, 76.6500], popular: false },
      { name: "Dehra Gopipur", district: "Kangra", coordinates: [31.8900, 76.2200], popular: false },
    ],
  },
  Mandi: {
    center: [31.7087, 76.9320],
    towns: [
      { name: "Mandi Town", district: "Mandi", coordinates: [31.7087, 76.9320], popular: true },
      { name: "Sundernagar", district: "Mandi", coordinates: [31.5320, 76.8920], popular: true },
      { name: "Jogindernagar", district: "Mandi", coordinates: [31.9850, 76.7720], popular: false },
      { name: "Sarkaghat", district: "Mandi", coordinates: [31.7010, 76.7350], popular: false },
      { name: "Karsog", district: "Mandi", coordinates: [31.3850, 77.2050], popular: false },
    ],
  },
  Kullu: {
    center: [31.9579, 77.1095],
    towns: [
      { name: "Kullu Town", district: "Kullu", coordinates: [31.9579, 77.1095], popular: true },
      { name: "Manali", district: "Kullu", coordinates: [32.2432, 77.1892], popular: true },
      { name: "Bhuntar", district: "Kullu", coordinates: [31.8790, 77.1530], popular: true },
      { name: "Naggar", district: "Kullu", coordinates: [32.1180, 77.1680], popular: false },
      { name: "Banjar / Tirthan", district: "Kullu", coordinates: [31.6380, 77.3450], popular: false },
    ],
  },
  Bilaspur: {
    center: [31.3417, 76.7570],
    towns: [
      { name: "Bilaspur Town", district: "Bilaspur", coordinates: [31.3417, 76.7570], popular: true },
      { name: "Ghumarwin", district: "Bilaspur", coordinates: [31.4380, 76.7150], popular: true },
      { name: "Shri Naina Devi Ji", district: "Bilaspur", coordinates: [31.3060, 76.5380], popular: false },
    ],
  },
  Hamirpur: {
    center: [31.6862, 76.5213],
    towns: [
      { name: "Hamirpur Town", district: "Hamirpur", coordinates: [31.6862, 76.5213], popular: true },
      { name: "Nadaun", district: "Hamirpur", coordinates: [31.7820, 76.3450], popular: false },
      { name: "Barsar", district: "Hamirpur", coordinates: [31.5450, 76.4780], popular: false },
    ],
  },
  Una: {
    center: [31.4685, 76.2708],
    towns: [
      { name: "Una Town", district: "Una", coordinates: [31.4685, 76.2708], popular: true },
      { name: "Mehatpur", district: "Una", coordinates: [31.3980, 76.3020], popular: false },
      { name: "Amb", district: "Una", coordinates: [31.6850, 76.1200], popular: false },
    ],
  },
  Chamba: {
    center: [32.5534, 76.1258],
    towns: [
      { name: "Chamba Town", district: "Chamba", coordinates: [32.5534, 76.1258], popular: true },
      { name: "Dalhousie", district: "Chamba", coordinates: [32.5388, 75.9710], popular: true },
      { name: "Khajjiar", district: "Chamba", coordinates: [32.5500, 76.0600], popular: false },
    ],
  },
  Kinnaur: {
    center: [31.5372, 78.2728],
    towns: [
      { name: "Reckong Peo", district: "Kinnaur", coordinates: [31.5372, 78.2728], popular: true },
      { name: "Kalpa", district: "Kinnaur", coordinates: [31.5450, 78.2520], popular: false },
      { name: "Sangla", district: "Kinnaur", coordinates: [31.4250, 78.2650], popular: false },
    ],
  },
  "Lahaul & Spiti": {
    center: [32.5710, 77.0320],
    towns: [
      { name: "Keylong", district: "Lahaul & Spiti", coordinates: [32.5710, 77.0320], popular: true },
      { name: "Kaza", district: "Lahaul & Spiti", coordinates: [32.2270, 78.0710], popular: false },
    ],
  },
};

// Flattened base coordinates lookup for instant center lookup
export const CITY_BASE_COORDINATES: Record<string, [number, number]> = {
  All: [30.8200, 77.2000],
  // District Centers
  Sirmaur: [30.5599, 77.2955],
  Solan: [30.9084, 77.0999],
  Shimla: [31.1048, 77.1734],
  Kangra: [32.2190, 76.3234],
  Mandi: [31.7087, 76.9320],
  Kullu: [31.9579, 77.1095],
  // Sirmaur Towns
  Nahan: [30.5599, 77.2955],
  "Paonta Sahib": [30.4435, 77.6253],
  "Kala Amb": [30.4950, 77.2150],
  Shillai: [30.6872, 77.7212],
  Rajgarh: [30.8524, 77.3050],
  "Dadahu / Renuka Ji": [30.6050, 77.4520],
  Dadahu: [30.6050, 77.4520],
  "Renuka Ji": [30.6050, 77.4520],
  Sarahan: [30.7480, 77.2180],
  "Sarahan / Pacchad": [30.7480, 77.2180],
  Kafota: [30.5890, 77.6320],
  Haripurdhar: [30.7710, 77.5180],
  Majra: [30.4680, 77.5320],
  Dhaulakuan: [30.5050, 77.4650],
  Trilokpur: [30.5140, 77.2350],
  // Solan Towns
  "Solan City": [30.9084, 77.0999],
  Baddi: [30.9578, 76.7914],
  Barotiwala: [30.9250, 76.8400],
  Nalagarh: [31.0420, 76.7200],
  Dharampur: [30.9050, 77.0250],
  Kandaghat: [30.9650, 77.1120],
  Kumarhatti: [30.8870, 77.0480],
  Kasauli: [30.9013, 76.9649],
  Parwanoo: [30.8350, 76.9600],
  Arki: [31.1510, 76.9680],
  Chail: [30.9730, 77.1900],
  // Shimla Towns
  "Shimla City": [31.1048, 77.1734],
  Sanjauli: [31.1015, 77.1950],
  "New Shimla": [31.0780, 77.1720],
  Dhalli: [31.1150, 77.2050],
  "Summer Hill": [31.1110, 77.1350],
  Theog: [31.1210, 77.3550],
  "Rampur Bushahr": [31.4490, 77.6350],
  Rohru: [31.2050, 77.7520],
  Kotkhai: [31.1200, 77.5300],
  Jubbal: [31.1100, 77.6650],
  // Kangra Towns
  Dharamshala: [32.2190, 76.3234],
  "McLeod Ganj": [32.2426, 76.3213],
  Palampur: [32.1109, 76.5363],
  "Kangra Town": [32.0998, 76.2691],
  // Mandi Towns
  "Mandi Town": [31.7087, 76.9320],
  Sundernagar: [31.5320, 76.8920],
  // Kullu Towns
  "Kullu Town": [31.9579, 77.1095],
  Manali: [32.2432, 77.1892],
  Bhuntar: [31.8790, 77.1530],
};

export const HIMACHAL_LOCALITIES: LocalityItem[] = [
  // NAHAN MOHALLAS
  { id: "nh-nayabazar", name: "Naya Bazar", city: "Nahan", district: "Sirmaur", coordinates: [30.5590, 77.2950], category: "Main Market", popular: true },
  { id: "nh-badachowk", name: "Bada Chowk", city: "Nahan", district: "Sirmaur", coordinates: [30.5580, 77.2945], category: "Central Bazar", popular: true },
  { id: "nh-chhotachowk", name: "Chhota Chowk", city: "Nahan", district: "Sirmaur", coordinates: [30.5575, 77.2952], category: "Old Heritage Bazar", popular: true },
  { id: "nh-ranital", name: "Ranital", city: "Nahan", district: "Sirmaur", coordinates: [30.5578, 77.2974], category: "Garden & Lake", popular: true },
  { id: "nh-gunnu", name: "Gunnu Ghat", city: "Nahan", district: "Sirmaur", coordinates: [30.5585, 77.2940], category: "Junction", popular: true },
  { id: "nh-kachatank", name: "Kacha Tank", city: "Nahan", district: "Sirmaur", coordinates: [30.5630, 77.2925], category: "Residential", popular: true },
  { id: "nh-pakkatank", name: "Pakka Tank", city: "Nahan", district: "Sirmaur", coordinates: [30.5615, 77.2945], category: "Heritage Pond", popular: true },
  { id: "nh-chogan", name: "Chogan Ground", city: "Nahan", district: "Sirmaur", coordinates: [30.5592, 77.2968], category: "Town Center", popular: true },
  { id: "nh-delhigate", name: "Delhi Gate", city: "Nahan", district: "Sirmaur", coordinates: [30.5562, 77.2938], category: "Commercial", popular: true },
  { id: "nh-haripur", name: "Haripur Mohalla", city: "Nahan", district: "Sirmaur", coordinates: [30.5520, 77.2880], category: "Residential", popular: true },
  // PAONTA SAHIB AREAS
  { id: "ps-badripur", name: "Badripur", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4480, 77.6180], category: "Residential & Markets", popular: true },
  { id: "ps-shamsherpur", name: "Shamsherpur", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4410, 77.6320], category: "Industrial & Housing", popular: true },
  { id: "ps-gurudwara", name: "Near Gurudwara Sahib", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4390, 77.6250], category: "Heritage / Yamuna Bank", popular: true },
  { id: "ps-mainbazar", name: "Main Bazar", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4420, 77.6240], category: "Shopping Heart", popular: true },
  { id: "ps-taruwala", name: "Taruwala", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4550, 77.6120], category: "High Rental Area", popular: true },
  { id: "ps-ypoint", name: "Y-Point Highway", city: "Paonta Sahib", district: "Sirmaur", coordinates: [30.4500, 77.6050], category: "NH Transit Area", popular: true },
  // KALA AMB AREAS
  { id: "ka-indarea", name: "Industrial Area Phase 1 & 2", city: "Kala Amb", district: "Sirmaur", coordinates: [30.4950, 77.2150], category: "Worker & Engineer Flats", popular: true },
  { id: "ka-mainbazar", name: "Kala Amb Main Bazar", city: "Kala Amb", district: "Sirmaur", coordinates: [30.4980, 77.2100], category: "Market", popular: true },
  { id: "ka-moginand", name: "Moginand", city: "Kala Amb", district: "Sirmaur", coordinates: [30.5080, 77.2280], category: "Residential & Colleges", popular: true },
  // SHILLAI AREAS
  { id: "sh-mainbazar", name: "Shillai Main Bazar", city: "Shillai", district: "Sirmaur", coordinates: [30.6872, 77.7212], category: "Market & Tehsil Office", popular: true },
  { id: "sh-collegeroad", name: "Degree College Road", city: "Shillai", district: "Sirmaur", coordinates: [30.6890, 77.7240], category: "Student Hub", popular: true },
  // SOLAN & BADDI AREAS
  { id: "sl-mallroad", name: "Mall Road", city: "Solan City", district: "Solan", coordinates: [30.9084, 77.0999], category: "Heart", popular: true },
  { id: "sl-chambaghat", name: "Chambaghat", city: "Solan City", district: "Solan", coordinates: [30.9230, 77.1080], category: "Mushroom City", popular: true },
  { id: "sl-kotlanala", name: "Kotlanala", city: "Solan City", district: "Solan", coordinates: [30.9020, 77.1040], category: "Student Hub", popular: true },
  { id: "bd-phase1", name: "Baddi Phase 1 & 2", city: "Baddi", district: "Solan", coordinates: [30.9578, 76.7914], category: "Industrial Hub", popular: true },
  { id: "bd-sandholi", name: "Sandholi / Sai Road", city: "Baddi", district: "Solan", coordinates: [30.9620, 76.8020], category: "Rental Localities", popular: true },
  // SHIMLA AREAS
  { id: "sh-ridge", name: "The Ridge / Mall Road", city: "Shimla City", district: "Shimla", coordinates: [31.1048, 77.1734], category: "Cultural Heart", popular: true },
  { id: "sh-sanjauli", name: "Sanjauli", city: "Shimla City", district: "Shimla", coordinates: [31.1015, 77.1950], category: "Student Hub", popular: true },
  { id: "sh-summerhill", name: "Summer Hill (HPU)", city: "Shimla City", district: "Shimla", coordinates: [31.1110, 77.1350], category: "University Campus", popular: true },
];

/**
 * Get towns for a given district
 */
export function getTownsForDistrict(districtName: string): DistrictTownItem[] {
  const d = HIMACHAL_DISTRICT_DATA[districtName];
  if (d) return d.towns;
  return [];
}

/**
 * Filter localities matching query and optional city/district filter
 */
export function searchLocalities(query: string, cityOrDistrict?: string): LocalityItem[] {
  const q = query.trim().toLowerCase();
  return HIMACHAL_LOCALITIES.filter((loc) => {
    if (cityOrDistrict && cityOrDistrict !== "All") {
      const matchCity = loc.city.toLowerCase() === cityOrDistrict.toLowerCase();
      const matchDistrict = (loc.district || "").toLowerCase() === cityOrDistrict.toLowerCase();
      if (!matchCity && !matchDistrict) return false;
    }
    if (!q) return loc.popular;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      (loc.district && loc.district.toLowerCase().includes(q))
    );
  });
}

/**
 * Resolve exact coordinates for locality name
 */
export function getCoordinatesForLocality(
  localityName: string,
  cityName?: string
): [number, number] | null {
  if (!localityName || !localityName.trim()) return null;
  const lLower = localityName.trim().toLowerCase();

  const match = HIMACHAL_LOCALITIES.find((loc) => {
    const locLower = loc.name.toLowerCase();
    const cityMatch = !cityName || cityName === "All" || loc.city.toLowerCase() === cityName.toLowerCase();
    return cityMatch && (lLower.includes(locLower) || locLower.includes(lLower));
  });

  if (match) return match.coordinates;
  return null;
}

/**
 * Returns exact coordinates or defaults to town / district center with micro-offset.
 * Never returns null, undefined, or NaN!
 */
export function getSafeCoordinates(
  localityName?: string,
  cityName?: string,
  districtName?: string
): [number, number] {
  // 1. Check direct town match in base table
  const townKey = (cityName || districtName || "Nahan").trim();
  const matchedBase =
    CITY_BASE_COORDINATES[townKey] ||
    (cityName ? CITY_BASE_COORDINATES[cityName] : null) ||
    (districtName ? CITY_BASE_COORDINATES[districtName] : null) ||
    CITY_BASE_COORDINATES["Sirmaur"] ||
    [30.5599, 77.2955];

  if (!localityName || typeof localityName !== "string" || !localityName.trim()) {
    return [matchedBase[0], matchedBase[1]];
  }

  const cleanLocality = localityName.trim();
  const matched = getCoordinatesForLocality(cleanLocality, cityName);
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

  const lat = Number((matchedBase[0] + latOffset).toFixed(5));
  const lng = Number((matchedBase[1] + lngOffset).toFixed(5));

  if (isNaN(lat) || isNaN(lng)) {
    return [matchedBase[0], matchedBase[1]];
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
