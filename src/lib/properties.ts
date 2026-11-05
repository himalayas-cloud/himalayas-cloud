import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { PropertyListing } from "@/types";

export const PROPERTIES = "properties";
export const PROPERTY_IMAGES = "propertyImages";
export const LISTINGS_META_DOC = ["meta", "listings"] as const;

function clean<T extends Record<string, any>>(data: T) {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

export function toMillis(value: any): number {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Triggers server-side cache revalidation and bumps the live version document
 * so all connected clients update their listings without page reload.
 */
export async function notifyListingsChanged(propertyId?: string) {
  try {
    const token = await auth.currentUser?.getIdToken().catch(() => null);
    if (token) {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId }),
      }).catch((e) => console.warn("Revalidate POST failed:", e));
    }
  } catch (err) {
    console.warn("Revalidate notification error:", err);
  }

  try {
    const metaRef = doc(db, LISTINGS_META_DOC[0], LISTINGS_META_DOC[1]);
    await setDoc(
      metaRef,
      {
        version: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch((e) => console.warn("Firestore meta bump failed:", e));
  } catch (err) {
    console.warn("Firestore live update broadcast failed:", err);
  }
}

export async function createPropertyListing(
  data: Omit<PropertyListing, "id" | "createdAt" | "updatedAt" | "images">,
  thumbs: string[],
  images: string[]
): Promise<string> {
  const listingRef = doc(collection(db, PROPERTIES));
  const batch = writeBatch(db);

  const coverThumb = thumbs[0] || data.coverThumb || "";
  const imageCount = Math.max(thumbs.length, images.length, 1);

  batch.set(listingRef, {
    ...clean(data),
    thumbs,
    coverThumb,
    imageCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, PROPERTY_IMAGES, listingRef.id), {
    ownerUid: data.ownerUid,
    images,
  });

  await batch.commit();
  await notifyListingsChanged(listingRef.id);
  return listingRef.id;
}

export async function updatePropertyListing(
  propertyId: string,
  updates: Partial<PropertyListing>,
  photos?: { thumbs: string[]; images: string[] }
): Promise<void> {
  const batch = writeBatch(db);

  const patch: Record<string, any> = {
    ...clean(updates),
    updatedAt: serverTimestamp(),
  };

  if (photos) {
    patch.thumbs = photos.thumbs;
    patch.coverThumb = photos.thumbs[0] || "";
    patch.imageCount = Math.max(photos.thumbs.length, photos.images.length, 1);
    const currentUid = auth.currentUser?.uid || updates.ownerUid;
    batch.set(
      doc(db, PROPERTY_IMAGES, propertyId),
      {
        ...(currentUid ? { ownerUid: currentUid } : {}),
        images: photos.images,
      },
      { merge: true }
    );
  }

  batch.update(doc(db, PROPERTIES, propertyId), patch);

  await batch.commit();
  await notifyListingsChanged(propertyId);
}

export async function deletePropertyListing(propertyId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, PROPERTIES, propertyId));
  batch.delete(doc(db, PROPERTY_IMAGES, propertyId));
  await batch.commit();
  await notifyListingsChanged(propertyId);
}

/** Owner dashboard: one listener, served from IndexedDB cache on re-open. */
export function subscribeOwnerProperties(
  ownerUid: string,
  onUpdate: (properties: PropertyListing[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, PROPERTIES), where("ownerUid", "==", ownerUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      onUpdate(list);
    },
    (err) => onError?.(err)
  );
}

/** Run once per owner: attaches ownerUid to old listings that only had ownerEmail. */
export async function migrateOwnerEmailListings(ownerUid: string, ownerEmail: string) {
  const flagKey = `owner-migrated:${ownerUid}`;
  if (typeof window !== "undefined" && window.localStorage.getItem(flagKey)) return;

  const snap = await getDocs(
    query(collection(db, PROPERTIES), where("ownerEmail", "==", ownerEmail))
  );
  const batch = writeBatch(db);
  let changed = 0;
  snap.docs.forEach((d) => {
    if (d.data().ownerUid !== ownerUid) {
      batch.update(d.ref, { ownerUid });
      changed++;
    }
  });
  if (changed > 0) await batch.commit();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(flagKey, "1");
  }
}

export interface PropertiesPageResult {
  items: PropertyListing[];
  nextCursor: string | null;
}

/**
 * Server-side paginated query (8 listings per page).
 * Loads only thumbnails to keep server cache small and within limits.
 */
export async function fetchPublishedPage(
  cursor?: string | null,
  pageSize = 8,
  district?: string | null
): Promise<PropertiesPageResult> {
  const constraints: any[] = [
    where("status", "==", "published"),
  ];

  if (district) {
    constraints.push(where("district", "==", district));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (cursor) {
    const millis = Number(cursor);
    if (!isNaN(millis) && millis > 0) {
      constraints.push(startAfter(Timestamp.fromMillis(millis)));
    }
  }

  constraints.push(limit(pageSize + 1));

  let snapshot;
  try {
    const q = query(collection(db, PROPERTIES), ...constraints);
    snapshot = await getDocs(q);
  } catch (err: any) {
    // If the composite index is still being built or not yet created in Firebase Console,
    // gracefully fall back to a simple query so the site never throws 500 errors.
    if (err?.message?.includes("index")) {
      console.warn("Firestore index pending, using in-memory sort fallback:", err.message);
      const fallbackSnap = await getDocs(
        query(collection(db, PROPERTIES), where("status", "==", "published"))
      );
      let all = fallbackSnap.docs.map((d) => ({ ...d.data(), id: d.id }));
      if (district) {
        all = all.filter((d: any) => d.district?.toLowerCase() === district.toLowerCase());
      }
      all.sort((a: any, b: any) => toMillis(b.createdAt) - toMillis(a.createdAt));

      let startIndex = 0;
      if (cursor) {
        const cursorMillis = Number(cursor);
        const idx = all.findIndex((item: any) => toMillis(item.createdAt) === cursorMillis);
        if (idx !== -1) startIndex = idx + 1;
      }

      const paged = all.slice(startIndex, startIndex + pageSize + 1);
      const mappedFallback: PropertyListing[] = paged.map((data: any) => {
        const allPhotos: string[] =
          (Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : null) ||
          (Array.isArray(data.thumbs) && data.thumbs.length > 0 ? data.thumbs : null) ||
          (Array.isArray(data.images) && data.images.length > 0 ? data.images : null) ||
          (data.coverThumb ? [data.coverThumb] : []);

        const coverThumb =
          data.coverThumb ||
          allPhotos[0] ||
          "";

        const imageCount =
          data.imageCount ||
          allPhotos.length ||
          1;

        // Send up to 3 high-res preview photos per card for smooth swiping across all listings
        const cardThumbs = allPhotos.slice(0, 3);

        const { photos: _p, images: _i, ...rest } = data;

        return {
          ...rest,
          id: data.id,
          thumbs: cardThumbs,
          photos: cardThumbs,
          coverThumb,
          imageCount,
          createdAt: toMillis(data.createdAt),
          updatedAt: toMillis(data.updatedAt),
        } as PropertyListing;
      });

      const hasMoreFallback = mappedFallback.length > pageSize;
      const itemsFallback = hasMoreFallback ? mappedFallback.slice(0, pageSize) : mappedFallback;
      const lastItemFallback = itemsFallback[itemsFallback.length - 1];
      const nextCursorFallback =
        hasMoreFallback && lastItemFallback ? String(lastItemFallback.createdAt || "") : null;

      return { items: itemsFallback, nextCursor: nextCursorFallback };
    }
    throw err;
  }

  const mapped: PropertyListing[] = snapshot.docs.map((d) => {
    const data = d.data();
    const allPhotos: string[] =
      (Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : null) ||
      (Array.isArray(data.thumbs) && data.thumbs.length > 0 ? data.thumbs : null) ||
      (Array.isArray(data.images) && data.images.length > 0 ? data.images : null) ||
      (data.coverThumb ? [data.coverThumb] : []);

    const coverThumb =
      data.coverThumb ||
      allPhotos[0] ||
      "";

    const imageCount =
      data.imageCount ||
      allPhotos.length ||
      1;

    // Send up to 3 high-res preview photos per card for smooth swiping across all listings
    const cardThumbs = allPhotos.slice(0, 3);

    const { photos: _p, images: _i, ...rest } = data;

    return {
      ...rest,
      id: d.id,
      thumbs: cardThumbs,
      photos: cardThumbs,
      coverThumb,
      imageCount,
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    } as PropertyListing;
  });

  const hasMore = mapped.length > pageSize;
  const items = hasMore ? mapped.slice(0, pageSize) : mapped;
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem ? String(lastItem.createdAt || "") : null;

  return { items, nextCursor };
}

export async function fetchPublishedProperties(district?: string | null, maxLimit = 100) {
  const page = await fetchPublishedPage(null, maxLimit, district);
  return page.items;
}

export async function fetchPropertyWithImages(propertyId: string): Promise<PropertyListing | null> {
  const [listingSnap, imagesSnap] = await Promise.all([
    getDoc(doc(db, PROPERTIES, propertyId)).catch(() => null),
    getDoc(doc(db, PROPERTY_IMAGES, propertyId)).catch((e) => {
      console.warn("Could not read propertyImages doc (permissions or non-existent):", e?.message);
      return null;
    }),
  ]);

  if (!listingSnap || !listingSnap.exists() || listingSnap.data().status !== "published") {
    return null;
  }

  const data = listingSnap.data();
  const fullImages = imagesSnap?.exists()
    ? (imagesSnap.data()?.images as string[] | undefined)
    : undefined;

  const images =
    fullImages && fullImages.length > 0
      ? fullImages
      : data.thumbs && data.thumbs.length > 0
        ? data.thumbs
        : data.images || data.photos || (data.coverThumb ? [data.coverThumb] : []);

  return {
    ...data,
    id: listingSnap.id,
    thumbs: data.thumbs || (data.coverThumb ? [data.coverThumb] : []),
    coverThumb: data.coverThumb || images[0] || "",
    images,
    photos: images,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  } as PropertyListing;
}
