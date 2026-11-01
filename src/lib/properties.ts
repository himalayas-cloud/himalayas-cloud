import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { PropertyListing } from "@/types";

const PROPERTIES_COLLECTION = "properties";

/**
 * Strips any undefined fields from object to prevent Firestore unsupported field value errors.
 */
function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Creates a new property rental listing in Cloud Firestore.
 */
export async function createPropertyListing(
  data: Omit<PropertyListing, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const collectionRef = collection(db, PROPERTIES_COLLECTION);
  const cleanData = cleanFirestoreData(data);
  const docRef = await addDoc(collectionRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Real-time subscription to listings owned by the logged-in owner.
 */
export function subscribeOwnerProperties(
  ownerUid: string,
  onUpdate: (properties: PropertyListing[]) => void,
  onError?: (error: Error) => void,
  ownerEmail?: string | null
) {
  if (ownerEmail) {
    let propsByUid: PropertyListing[] = [];
    let propsByEmail: PropertyListing[] = [];

    const mergeAndEmit = () => {
      const map = new Map<string, PropertyListing>();
      [...propsByUid, ...propsByEmail].forEach((p) => {
        if (p.id) map.set(p.id, p);
      });
      const merged = Array.from(map.values());
      merged.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      onUpdate(merged);
    };

    const unsubUid = onSnapshot(
      query(collection(db, PROPERTIES_COLLECTION), where("ownerUid", "==", ownerUid)),
      (snapshot) => {
        propsByUid = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PropertyListing, "id">),
        }));
        mergeAndEmit();
      },
      (err) => {
        if (onError) onError(err);
      }
    );

    const unsubEmail = onSnapshot(
      query(collection(db, PROPERTIES_COLLECTION), where("ownerEmail", "==", ownerEmail)),
      (snapshot) => {
        propsByEmail = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PropertyListing, "id">),
        }));
        mergeAndEmit();
      },
      (err) => {
        console.warn("Owner email query fallback:", err);
      }
    );

    return () => {
      unsubUid();
      unsubEmail();
    };
  }

  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where("ownerUid", "==", ownerUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const properties: PropertyListing[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PropertyListing, "id">),
      }));
      // Sort in memory by createdAt descending
      properties.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      onUpdate(properties);
    },
    (err) => {
      console.error("Error subscribing to owner properties:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time subscription to all published listings for visitors.
 */
export function subscribePublishedProperties(
  onUpdate: (properties: PropertyListing[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where("status", "==", "published")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const properties: PropertyListing[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PropertyListing, "id">),
      }));
      properties.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      onUpdate(properties);
    },
    (err) => {
      console.error("Error subscribing to published properties:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * One-shot fetch for published properties (used by Next.js edge-cached API routes).
 * Returns JSON-serializable property listings so responses can be cached across edge CDNs.
 */
export async function fetchPublishedProperties(): Promise<any[]> {
  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where("status", "==", "published")
  );

  const snapshot = await getDocs(q);
  const properties = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
    };
  });

  properties.sort((a, b) => b.createdAt - a.createdAt);
  return properties;
}

/**
 * Updates an existing property listing.
 */
export async function updatePropertyListing(
  propertyId: string,
  updates: Partial<PropertyListing>
): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a property listing.
 */
export async function deletePropertyListing(propertyId: string): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await deleteDoc(docRef);
}
