import { NextResponse } from "next/server";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import sharp from "sharp";

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

async function createThumb(base64Str: string): Promise<string> {
  try {
    if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;
    const match = base64Str.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
    const data = match ? match[1] : base64Str;
    const inputBuffer = Buffer.from(data, "base64");

    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 55 })
      .toBuffer();

    return `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
  } catch (err: any) {
    console.warn("Failed to create thumb:", err.message);
    return base64Str;
  }
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const uid = token ? await verifyFirebaseToken(token) : null;
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await getDocs(collection(db, "properties"));
    let migrated = 0;

    for (const d of snap.docs) {
      const data = d.data();
      // Skip if already has compressed thumbs
      if (Array.isArray(data.thumbs) && data.thumbs.length > 0) continue;

      const photos = data.photos || data.images || [];
      if (photos.length === 0) continue;

      const thumbs: string[] = [];
      for (const p of photos) {
        const t = await createThumb(p);
        thumbs.push(t);
      }

      // Write full photos to propertyImages
      await setDoc(
        doc(db, "propertyImages", d.id),
        {
          ownerUid: data.ownerUid || uid,
          images: photos,
        },
        { merge: true }
      );

      // Write lightweight thumbs to properties
      await setDoc(
        doc(db, "properties", d.id),
        {
          thumbs,
          coverThumb: thumbs[0] || "",
          imageCount: thumbs.length,
          photos: thumbs,
        },
        { merge: true }
      );

      migrated++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migrated} legacy listings to dual base64 format.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Migration failed", details: err?.message },
      { status: 500 }
    );
  }
}

