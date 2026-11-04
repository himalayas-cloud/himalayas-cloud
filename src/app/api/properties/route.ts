import { NextRequest, NextResponse } from "next/server";
import { getCachedPropertiesPage, getCachedAllProperties } from "@/lib/properties-cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const district = searchParams.get("district");
    const all = searchParams.get("all");

    if (all === "true") {
      const items = await getCachedAllProperties(district);
      return NextResponse.json(
        { items },
        {
          headers: {
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        }
      );
    }

    const page = await getCachedPropertiesPage(cursor, district);

    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error?.message },
      { status: 500 }
    );
  }
}
