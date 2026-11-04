import { NextRequest, NextResponse } from "next/server";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const page = await getCachedPropertiesPage(cursor);

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
