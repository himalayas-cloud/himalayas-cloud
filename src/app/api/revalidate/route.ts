import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

async function verifyFirebaseToken(idToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkP-fay54DVjH3YlA-yMPtqhVR1y5LYM4";
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

function safeRevalidate(tag: string) {
  try {
    // In Next.js 16, { expire: 0 } explicitly purges stale cache entries immediately
    (revalidateTag as any)(tag, { expire: 0 });
  } catch {
    try {
      (revalidateTag as any)(tag);
    } catch (e) {
      console.warn("Failed to revalidate tag:", tag, e);
    }
  }
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyFirebaseToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await req.json().catch(() => ({}));
  safeRevalidate("properties");
  if (typeof propertyId === "string" && propertyId) {
    safeRevalidate(`property:${propertyId}`);
  }

  return NextResponse.json({ revalidated: true });
}
