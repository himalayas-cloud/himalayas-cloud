import { NextResponse } from "next/server";
import { getCachedProperty } from "@/lib/properties-cache";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getCachedProperty(id);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(property, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
