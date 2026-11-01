import { NextResponse } from "next/server";
import { fetchPublishedProperties } from "@/lib/properties";

// Server route returning published properties with Edge CDN cache headers
export async function GET() {
  try {
    const properties = await fetchPublishedProperties();
    return NextResponse.json(properties, {
      status: 200,
      headers: {
        // Caches on Vercel Edge CDN for 60 seconds.
        // Even with 50,000 visitors, Vercel Edge responds directly from memory without hitting Firestore!
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching properties for cache:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error?.message },
      { status: 500 }
    );
  }
}
