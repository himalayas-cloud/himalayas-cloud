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
  onError?: (error: Error) => void
) {
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
