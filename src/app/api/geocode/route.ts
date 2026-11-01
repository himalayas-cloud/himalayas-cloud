import { NextRequest, NextResponse } from "next/server";
import { searchLocalities, getSafeCoordinates } from "@/lib/localities";

export interface GeocodeItem {
  id: string;
  name: string;
  displayName: string;
  city: string;
  coordinates: [number, number];
  source: "google" | "nominatim" | "local";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "Nahan";

  if (!q) {
    // Return popular localities for the selected city
    const popular = searchLocalities("", city).map((loc) => ({
      id: loc.id,
      name: loc.name,
      displayName: `${loc.name}, ${loc.city}`,
      city: loc.city,
      coordinates: loc.coordinates,
      source: "local" as const,
    }));
    return NextResponse.json({ results: popular });
  }

  const results: GeocodeItem[] = [];
  const seenCoordinates = new Set<string>();

  // 1. Local curated database lookup (Fastest 0ms match)
  const localMatches = searchLocalities(q, city);
  for (const loc of localMatches) {
    const key = `${loc.coordinates[0].toFixed(3)},${loc.coordinates[1].toFixed(3)}`;
    seenCoordinates.add(key);
    results.push({
      id: loc.id,
      name: loc.name,
      displayName: `${loc.name}, ${loc.city}`,
      city: loc.city,
      coordinates: loc.coordinates,
      source: "local",
    });
  }

  // 2. Google Maps Geocoding API (if Google API Key is provided)
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (googleApiKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        `${q}, ${city}, Himachal Pradesh, India`
      )}&key=${googleApiKey}`;

      const res = await fetch(googleUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "OK" && Array.isArray(data.results)) {
          for (const item of data.results.slice(0, 4)) {
            const lat = item.geometry.location.lat;
            const lng = item.geometry.location.lng;
            const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
            if (!seenCoordinates.has(key)) {
              seenCoordinates.add(key);
              results.push({
                id: `google-${item.place_id || Math.random()}`,
                name: q,
                displayName: item.formatted_address,
                city: city,
                coordinates: [lat, lng],
                source: "google",
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Google Geocoding error:", err);
    }
  }

  // 3. OpenStreetMap / Nominatim Geocoding (100% Free, No API key, No credit card needed!)
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${q}, ${city}, Himachal Pradesh, India`
    )}&limit=5&addressdetails=1`;

    const nomRes = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "RentHimalayas-Marketplace/1.0 (https://renthimalayas.com; contact: info@renthimalayas.com)",
      },
      next: { revalidate: 3600 },
    });

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData)) {
        for (const item of nomData) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
          if (!seenCoordinates.has(key)) {
            seenCoordinates.add(key);
            // Simplify long address to first 2 segments
            const parts = (item.display_name || "").split(",");
            const shortName = parts.slice(0, 2).join(",").trim() || q;
            results.push({
              id: `nom-${item.place_id || Math.random()}`,
              name: shortName,
              displayName: item.display_name,
              city: city,
              coordinates: [lat, lng],
              source: "nominatim",
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Nominatim Geocoding error:", err);
  }

  // 4. Guaranteed Safe Fallback if nothing else matched
  if (results.length === 0) {
    const fallbackCoord = getSafeCoordinates(q, city);
    results.push({
      id: `fallback-${Date.now()}`,
      name: q,
      displayName: `${q}, ${city}, Himachal Pradesh`,
      city: city,
      coordinates: fallbackCoord,
      source: "local",
    });
  }

  return NextResponse.json({ results });
}
